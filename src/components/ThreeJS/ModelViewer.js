import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import PopupChart from '../Charts/popupLineChart';
import { graphFetch } from '../../api/fetchConfig';

const ModelViewer = ({ tabId }) => {
  const mountRef = useRef(null);
  const controlsRef = useRef(null);
  // 팝업 상태
  const [popupOpen, setPopupOpen] = useState(false);
  // IOT 데이터 상태 (LineChartBase와 동일 구조)
  const [data, setData] = useState([]);
  const [lines, setLines] = useState([]);

  // 관심 지점(Point of Interest) 데이터 정의
  const pointsOfInterestData = [
    { id: 'point1', position3D: new THREE.Vector3(0.15786327805243783, -0.3386878229735448, 0.06679536040505821), baseText: '포인트 1' },
  ];

  // IOT 데이터 fetch 함수 (IotChart와 동일)
  const fetchIotData = () => {
    const query = `
      query getPowerData {
        getPowerData {
          timeLabel
          deviceId
          power
        }
      }
    `;
    graphFetch(query).then((apiResponse) => {
      // 1. API 응답 자체가 없는 경우 처리
      if (!apiResponse) {
        console.error('IOT 데이터 fetch 실패: 응답 데이터가 없습니다.');
        return;
      }
      // 2. API 응답 내에 errors 필드가 있는지 확인
      if (apiResponse.errors) {
        console.error('IOT 데이터 fetch 실패 (GraphQL 오류):', apiResponse.errors);
        return;
      }

      // 3. 오류가 없다면 getPowerData 접근
      const result = apiResponse.getPowerData;

      if (result && result.length > 0) {
        const deviceIds = new Set();
        const newDataPoint = {};
        newDataPoint.timeLabel = result[0].timeLabel.replace("T"," ").replace("Z"," ");
        result.forEach(item => {
          deviceIds.add(item.deviceId);
          const raw = parseFloat(item.power);
          newDataPoint[item.deviceId] = Number(raw.toFixed(2));
        });
        setData(prev => {
          const updated = [...prev, newDataPoint];
          if(updated.length > 60){ updated.shift(); }
          return updated;
        });
        const availableColors = ["blue", "deeppink", "green", "orange", "purple", "red"];
        const newLines = Array.from(deviceIds).map((deviceId, idx) => ({
          key: deviceId,
          color: availableColors[idx % availableColors.length]
        }));
        setLines(newLines);
      } else {
        // getPowerData는 존재하지만, 데이터가 비어있는 경우 (오류는 아님)
        console.warn('IOT 데이터는 수신했으나, getPowerData 결과가 비어있거나 null입니다:', result);
      }
    }).catch(error => {
      // graphFetch 자체의 실패 또는 네트워크 오류 등
      console.error('graphFetch 실행 중 오류 발생:', error);
    });
  };

  useEffect(() => {
    const currentMount = mountRef.current;
    if (!currentMount) return;

    let camera, renderer;
    let pointMeshes = [];
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let animationFrameId;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xeeeeee);

    camera = new THREE.PerspectiveCamera(75, currentMount.clientWidth / currentMount.clientHeight, 0.1, 1000);
    camera.position.set(0, 1.5, 3);

    try {
      renderer = new THREE.WebGLRenderer({ antialias: true });
    } catch (error) {
      const errorDiv = document.createElement('div');
      errorDiv.innerHTML = `<h2>WebGL 컨텍스트를 생성할 수 없습니다.</h2>`;
      errorDiv.style.padding = '20px';
      errorDiv.style.color = 'red';
      currentMount.innerHTML = '';
      currentMount.appendChild(errorDiv);
      return;
    }
    renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    currentMount.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.minDistance = 1;
    controls.maxDistance = 500;
    controls.target.set(0, 1, 0);
    controlsRef.current = controls;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 10, 7.5);
    scene.add(directionalLight);

    const loader = new GLTFLoader();
    const modelPath = '/models/testModel.glb';
    loader.load(
      modelPath,
      (gltf) => {
        const model = gltf.scene;
        scene.add(model);
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        controls.target.copy(center);
      },
      undefined,
      (error) => {
        const errorDiv = document.createElement('div');
        errorDiv.innerHTML = `<h2>모델 로딩 실패</h2>`;
        errorDiv.style.padding = '20px';
        errorDiv.style.color = 'orange';
        currentMount.appendChild(errorDiv);
      }
    );

    pointMeshes = pointsOfInterestData.map(pointData => {
      const geometry = new THREE.SphereGeometry(0.05, 16, 16);
      const material = new THREE.MeshBasicMaterial({ color: 0xd32f2f });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.copy(pointData.position3D);
      mesh.userData = { id: pointData.id, baseText: pointData.baseText, position3D: pointData.position3D };
      scene.add(mesh);
      return mesh;
    });

    // 클릭 이벤트 핸들러
    const onClick = (event) => {
      if (!currentMount || !renderer || !camera) return;
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      // 포인트 클릭 처리
      const intersects = raycaster.intersectObjects(pointMeshes);
      if (intersects.length > 0) {
        const intersectedObject = intersects[0].object;
        if (intersectedObject.userData && (intersectedObject.userData.id === 'point1')) {
          setPopupOpen(true);
          fetchIotData();
          return;
        }
      }
      // 모델 표면 클릭 시 좌표만 콘솔에 출력
      const intersectsModel = raycaster.intersectObjects(scene.children, true);
      if (intersectsModel.length > 0) {
        const point = intersectsModel[0].point;
        console.log('클릭한 3D 좌표:', point);
      }
    };

    if (renderer && renderer.domElement) {
      renderer.domElement.addEventListener('click', onClick);
    }

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      controls.update();
      if (renderer && camera) renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (currentMount && renderer && camera) {
        camera.aspect = currentMount.clientWidth / currentMount.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      if (renderer && renderer.domElement) {
        renderer.domElement.removeEventListener('click', onClick);
      }
      if (controlsRef.current) controlsRef.current.dispose();
      pointMeshes.forEach(mesh => {
        scene.remove(mesh);
        if (mesh.geometry) mesh.geometry.dispose();
        if (mesh.material) mesh.material.dispose();
      });
      if (renderer) {
        renderer.dispose();
        if (renderer.domElement && renderer.domElement.parentNode === currentMount) {
          currentMount.removeChild(renderer.domElement);
        }
      }
    };
  }, [tabId]);

  return (
    <>
      <div ref={mountRef} style={{ width: '100%', height: 'calc(100vh - 150px)', minHeight: '500px', border: '1px solid #ccc' }} />
      <PopupChart
        open={popupOpen}
        onClose={() => setPopupOpen(false)}
        data={data}
        lines={lines}
      />
    </>
  );
};

export default ModelViewer;