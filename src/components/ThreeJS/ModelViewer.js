import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const ModelViewer = ({ tabId }) => {
  const mountRef = useRef(null);
  const controlsRef = useRef(null); // OrbitControls 참조
  const tooltipRef = useRef(null); // 툴팁 DOM 요소를 위한 Ref
  const [clickCount, setClickCount] = useState(0); // 클릭 횟수 상태
  const [clickMessage, setClickMessage] = useState(''); // 표시될 메시지 상태
  const [lastClickedPoint, setLastClickedPoint] = useState(null); // 마지막으로 클릭된 포인트의 3D 위치

  // 1. 관심 지점(Point of Interest) 데이터 정의
  const pointsOfInterestData = [
    { id: 'point1', position3D: new THREE.Vector3(0, 1.5, 0.5), baseText: '포인트 1' },
    { id: 'point2', position3D: new THREE.Vector3(1, 1, -0.2), baseText: '포인트 2' },
    // 필요한 만큼 포인트 추가
  ];

  useEffect(() => {
    const currentMount = mountRef.current;
    if (!currentMount) return;

    let camera, renderer; // useEffect 스코프 내에서 사용될 변수로 선언
    let pointMeshes = []; // pointMeshes를 useEffect 스코프 내에서 관리
    const raycaster = new THREE.Raycaster(); // Raycaster도 useEffect 스코프 내에서 관리
    const mouse = new THREE.Vector2(); // Mouse 벡터도 useEffect 스코프 내에서 관리

    console.log('Mount Ref:', currentMount.clientWidth, currentMount.clientHeight);
    if (currentMount.clientWidth === 0 || currentMount.clientHeight === 0) {
      console.warn("Mount dimensions are zero. WebGL context creation might fail or renderer might not be visible.");
    }

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xeeeeee);

    camera = new THREE.PerspectiveCamera(75, currentMount.clientWidth / currentMount.clientHeight, 0.1, 1000);
    camera.position.set(0, 1.5, 3);

    try {
      renderer = new THREE.WebGLRenderer({ antialias: true });
    } catch (error) {
      console.error("Error creating WebGLRenderer:", error);
      const errorDiv = document.createElement('div');
      errorDiv.innerHTML = `<h2>WebGL 컨텍스트를 생성할 수 없습니다.</h2>
                           <p>브라우저가 WebGL을 지원하는지 확인하거나, 그래픽 드라이버를 업데이트해 보세요.</p>
                           <p><a href="https://get.webgl.org/" target="_blank" rel="noopener noreferrer">WebGL 지원 확인</a></p>`;
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
    const modelPath = '/models/3D_TEST_MODEL.glb';

    loader.load(
      modelPath,
      (gltf) => {
        const model = gltf.scene;
        scene.add(model);
        console.log('Model loaded successfully:', modelPath);
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        controls.target.copy(center);
      },
      (xhr) => {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
      },
      (error) => {
        console.error('An error happened during model loading:', error);
        const errorDiv = document.createElement('div');
        errorDiv.innerHTML = `<h2>모델 로딩 실패</h2>
                             <p>모델 파일 경로(${modelPath})를 확인하거나 파일이 올바른지 확인하세요.</p>`;
        errorDiv.style.padding = '20px';
        errorDiv.style.color = 'orange';
        currentMount.appendChild(errorDiv);
      }
    );

    // 툴팁 DOM 요소 생성 및 관리
    if (!tooltipRef.current) {
      tooltipRef.current = document.createElement('div');
      tooltipRef.current.id = 'model-tooltip';
      tooltipRef.current.style.position = 'absolute';
      tooltipRef.current.style.visibility = 'hidden';
      tooltipRef.current.style.background = 'rgba(0, 0, 0, 0.7)';
      tooltipRef.current.style.color = 'white';
      tooltipRef.current.style.padding = '5px 10px';
      tooltipRef.current.style.borderRadius = '3px';
      tooltipRef.current.style.pointerEvents = 'none';
      tooltipRef.current.style.zIndex = '1000';
      currentMount.appendChild(tooltipRef.current);
    }
    const currentTooltip = tooltipRef.current; // 클로저 내에서 사용하기 위해 변수 할당

    pointMeshes = pointsOfInterestData.map(pointData => {
      const geometry = new THREE.SphereGeometry(0.05, 16, 16);
      const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 }); // 클릭 포인트 색상 변경 (예: 녹색)
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.copy(pointData.position3D);
      mesh.userData = { id: pointData.id, baseText: pointData.baseText, position3D: pointData.position3D }; // userData에 3D 위치도 저장
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
      const intersects = raycaster.intersectObjects(pointMeshes);

      if (intersects.length > 0) {
        const intersectedObject = intersects[0].object;
        const newClickCount = clickCount + 1;
        setClickCount(newClickCount);
        setClickMessage(`${intersectedObject.userData.baseText} - ${newClickCount}번 클릭됨`);
        setLastClickedPoint(intersectedObject.userData.position3D.clone()); // 클릭된 위치 저장
      } else {
        // 빈 공간 클릭 시 메시지 숨김 및 카운트 초기화 (선택 사항)
        // setClickMessage('');
        // setClickCount(0);
        // setLastClickedPoint(null);
      }
    };

    if (renderer && renderer.domElement) {
        renderer.domElement.addEventListener('click', onClick); // 'click' 이벤트로 변경
    }

    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();

      if (clickMessage && lastClickedPoint && currentTooltip && camera && currentMount) {
        const screenPosition = lastClickedPoint.clone().project(camera);
        const x = (screenPosition.x * 0.5 + 0.5) * currentMount.clientWidth;
        const y = (-screenPosition.y * 0.5 + 0.5) * currentMount.clientHeight;

        currentTooltip.innerHTML = clickMessage;
        currentTooltip.style.left = `${x}px`;
        currentTooltip.style.top = `${y}px`;
        currentTooltip.style.transform = `translate(10px, -100%)`;
        currentTooltip.style.visibility = 'visible';
      } else if (currentTooltip) {
        currentTooltip.style.visibility = 'hidden';
      }

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
      console.log("Cleaning up ModelViewer for tab:", tabId);
      window.removeEventListener('resize', handleResize);
      if (renderer && renderer.domElement) {
        renderer.domElement.removeEventListener('click', onClick); // 'click' 이벤트 리스너 제거
      }
      if (controlsRef.current) {
        controlsRef.current.dispose();
      }
      
      pointMeshes.forEach(mesh => {
        scene.remove(mesh);
        if (mesh.geometry) mesh.geometry.dispose();
        if (mesh.material) mesh.material.dispose();
      });

      if (tooltipRef.current && tooltipRef.current.parentNode) {
        tooltipRef.current.parentNode.removeChild(tooltipRef.current);
      }
      
      while(scene.children.length > 0){ 
        scene.remove(scene.children[0]); 
      }

      scene.traverse(object => {
        if (object.geometry) object.geometry.dispose();
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach(mat => mat.dispose());
          } else {
            object.material.dispose();
          }
        }
      });

      if(renderer) {
        renderer.dispose();
        if (renderer.domElement && renderer.domElement.parentNode === currentMount) {
            currentMount.removeChild(renderer.domElement);
        }
      }
      console.log("Cleanup complete for tab:", tabId);
    };
  }, [tabId, clickCount, clickMessage, lastClickedPoint]); // clickCount, clickMessage, lastClickedPoint를 의존성 배열에 추가

  return <div ref={mountRef} style={{ width: '100%', height: 'calc(100vh - 150px)', minHeight: '500px', border: '1px solid #ccc' }} />;
};

export default ModelViewer;