import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import PopupChartFor3d from '../Charts/popupLineChartFor3d';
import { graphFetch } from '../../api/fetchConfig';

const ModelViewer = ({ tabId }) => {
  const mountRef = useRef(null);
  const controlsRef = useRef(null);
  // 팝업 상태
  const [popupOpen, setPopupOpen] = useState(false);
  const [selectedDeviceNumber, setSelectedDeviceNumber] = useState(null);
  // IOT 데이터 상태 (LineChartBase와 동일 구조)
  const [data, setData] = useState([]);
  const [lines, setLines] = useState([]);
  const [isMovingToPoint, setIsMovingToPoint] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const moveSpeed = 0.1;

  // 키보드 상태 관리를 위한 상태 추가
  const [keys, setKeys] = useState({
    w: false,
    a: false,
    s: false,
    d: false,
  });

  // 관심 지점(Point of Interest) 데이터 정의
  const pointsOfInterestData = [
    { id: 'point1', position3D: new THREE.Vector3(-6.673079694028458, 1.188442585181138, 4.602528073794443), baseText: '포인트 1', deviceNumber: '001' },
    { id: 'point2', position3D: new THREE.Vector3(-5.265677971408536, 0.4369102407435346, 5.60017773724662), baseText: '포인트 2', deviceNumber: '002' },
    { id: 'point3', position3D: new THREE.Vector3(4.8119280895793946, 1.0851206174651207, -2.307622247417798), baseText: '포인트 3', deviceNumber: '003' },
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

  // 키보드 이벤트 핸들러
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['w', 'a', 's', 'd'].includes(e.key.toLowerCase())) {
        setKeys(prev => ({ ...prev, [e.key.toLowerCase()]: true }));
      }
    };

    const handleKeyUp = (e) => {
      if (['w', 'a', 's', 'd'].includes(e.key.toLowerCase())) {
        setKeys(prev => ({ ...prev, [e.key.toLowerCase()]: false }));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // 포인트로 카메라 이동 함수
  const moveCameraToPoint = (targetPosition) => {
    if (!controlsRef.current) return;
    
    setIsMovingToPoint(true);
    const startPosition = controlsRef.current.object.position.clone();
    const startTarget = controlsRef.current.target.clone();
    const targetPoint = new THREE.Vector3(
      targetPosition.x,
      targetPosition.y + 1.5, // 정면에서 보도록 높이 조정
      targetPosition.z + 2    // 정면에서 보도록 거리 조정
    );
    
    let progress = 0;
    const duration = 1000;
    const startTime = Date.now();

    const animate = () => {
      const currentTime = Date.now();
      progress = Math.min((currentTime - startTime) / duration, 1);
      
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      
      controlsRef.current.object.position.lerpVectors(startPosition, targetPoint, easeProgress);
      controlsRef.current.target.lerpVectors(startTarget, targetPosition, easeProgress);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setIsMovingToPoint(false);
      }
    };
    
    animate();
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
    // 초기 카메라 위치 설정
    camera.position.set(-0.00001186967904497516, 11.89124935229853, 7.159123744649583e-7);
    camera.rotation.set(-1.5707962665899209, -9.98186035494785e-7, -1.510554921748329);

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
    // 초기 타겟 위치 설정
    controls.target.set(0, 0, 0);
    controlsRef.current = controls;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 10, 7.5);
    scene.add(directionalLight);

    const loader = new GLTFLoader();
    const modelPath = '/models/eightpin_office.glb';
    loader.load(
      modelPath,
      (gltf) => {
        const model = gltf.scene;
        scene.add(model);
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        controls.target.copy(center);
        setIsLoading(false); // 모델 로드 완료
      },
      undefined,
      (error) => {
        const errorDiv = document.createElement('div');
        errorDiv.innerHTML = `<h2>모델 로딩 실패</h2>`;
        errorDiv.style.padding = '20px';
        errorDiv.style.color = 'orange';
        currentMount.appendChild(errorDiv);
        setIsLoading(false);
      }
    );

    pointMeshes = pointsOfInterestData.map(pointData => {
      // 메인 포인트 (큰 구체)
      const mainGeometry = new THREE.SphereGeometry(0.08, 32, 32);
      const mainMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x00bfff,
        emissive: 0x00bfff,
        emissiveIntensity: 0.5,
        shininess: 100
      });
      const mainMesh = new THREE.Mesh(mainGeometry, mainMaterial);
      mainMesh.position.copy(pointData.position3D);
      mainMesh.userData.id = pointData.id;

      // 후광 효과 (더 큰 반투명 구체)
      const glowGeometry = new THREE.SphereGeometry(0.12, 32, 32);
      const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0x00bfff,
        transparent: true,
        opacity: 0.3
      });
      const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
      glowMesh.position.copy(pointData.position3D);

      // 그룹으로 묶기
      const group = new THREE.Group();
      group.add(mainMesh);
      group.add(glowMesh);
      scene.add(group);
      return mainMesh;
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
        const pointData = pointsOfInterestData.find(p => p.id === intersectedObject.userData.id);
        if (pointData) {
          setSelectedDeviceNumber(pointData.deviceNumber);
          setPopupOpen(true);
          moveCameraToPoint(pointData.position3D);
        }
      }

      // 모델 표면 클릭 시 좌표 출력
      const intersectsModel = raycaster.intersectObjects(scene.children, true);
      if (intersectsModel.length > 0) {
        const point = intersectsModel[0].point;
        console.log('클릭한 3D 좌표:', {
          x: point.x,
          y: point.y,
          z: point.z
        });
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
      <div ref={mountRef} style={{ width: '100%', height: 'calc(100vh - 150px)', minHeight: '500px', border: '1px solid #ccc', position: 'relative' }}>
        {isLoading && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'rgba(255, 255, 255, 0.9)',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '10px'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '3px solid #f3f3f3',
              borderTop: '3px solid #00bfff',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
            <style>
              {`
                @keyframes spin {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
                }
              `}
            </style>
            <span>Loading...</span>
          </div>
        )}
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          background: 'rgba(255, 255, 255, 0.9)',
          padding: '10px',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          zIndex: 1000,
          display: 'flex',
          gap: '8px'
        }}>
          {pointsOfInterestData.map((point) => (
            <div
              key={point.id}
              onClick={() => moveCameraToPoint(point.position3D)}
              style={{
                padding: '6px 12px',
                background: '#00bfff',
                color: 'white',
                borderRadius: '4px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                fontSize: '14px',
                fontWeight: '500',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              {point.baseText}
            </div>
          ))}
        </div>
      </div>
      <PopupChartFor3d
        open={popupOpen}
        onClose={() => {
          setPopupOpen(false);
          setSelectedDeviceNumber(null);
        }}
        deviceNumber={selectedDeviceNumber}
      />
    </>
  );
};

export default ModelViewer;