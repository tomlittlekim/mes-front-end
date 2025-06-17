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

  // 키보드 상태 관리를 위한 ref 추가 (클로저 문제 해결)
  const keysRef = useRef({
    w: false,
    a: false,
    s: false,
    d: false,
    ArrowUp: false,
    ArrowLeft: false,
    ArrowDown: false,
    ArrowRight: false,
  });
  
  // 키보드 상태 관리를 위한 상태 추가
  const [keys, setKeys] = useState({
    w: false,
    a: false,
    s: false,
    d: false,
    ArrowUp: false,
    ArrowLeft: false,
    ArrowDown: false,
    ArrowRight: false,
  });

  // 관심 지점(Point of Interest) 데이터 정의
  const pointsOfInterestData = [
    { id: 'point1', position3D: new THREE.Vector3(-2.7299824809894284, -0.27237625163658863, -4.314808416788175), baseText: '1', deviceNumber: '001' },
    { id: 'point2', position3D: new THREE.Vector3(1.7003679051161473, -0.5681640649922682, -4.890643372412229), baseText: '2', deviceNumber: '002' },
    { id: 'point3', position3D: new THREE.Vector3(8.609266807791741, -0.5948561952463649, 2.8991550064344365), baseText: '3', deviceNumber: '003' },
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
        console.error('IOT 데이터 fetch 실패 데이터가 없습니다.');
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
      const key = e.key.toLowerCase();
      if (['w', 'a', 's', 'd'].includes(key) || ['ArrowUp', 'ArrowLeft', 'ArrowDown', 'ArrowRight'].includes(e.key)) {
        e.preventDefault(); // 기본 동작 방지
        const keyToSet = ['ArrowUp', 'ArrowLeft', 'ArrowDown', 'ArrowRight'].includes(e.key) ? e.key : key;
        
        // ref 업데이트
        keysRef.current[keyToSet] = true;
        
        setKeys(prev => ({ ...prev, [keyToSet]: true }));
      }
    };

    const handleKeyUp = (e) => {
      const key = e.key.toLowerCase();
      if (['w', 'a', 's', 'd'].includes(key) || ['ArrowUp', 'ArrowLeft', 'ArrowDown', 'ArrowRight'].includes(e.key)) {
        e.preventDefault(); // 기본 동작 방지
        const keyToSet = ['ArrowUp', 'ArrowLeft', 'ArrowDown', 'ArrowRight'].includes(e.key) ? e.key : key;
        
        // ref 업데이트
        keysRef.current[keyToSet] = false;
        
        setKeys(prev => ({ ...prev, [keyToSet]: false }));
      }
    };

    // 이벤트를 document에 등록 (더 안정적)
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // 컴포넌트 마운트 시 포커스 설정
  useEffect(() => {
    if (mountRef.current) {
      mountRef.current.focus();
    }
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
    let hoveredSprite = null; // 현재 호버된 스프라이트 추적
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let animationFrameId;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xeeeeee);

    camera = new THREE.PerspectiveCamera(75, currentMount.clientWidth / currentMount.clientHeight, 0.1, 1000);
    // 초기 카메라 위치 설정
    camera.position.set(3.8851270759648884, 0.10072583026928666, 19.1734179922868735);
    camera.rotation.set(-0.026341629497861275, 0.5185637717693896, 0.013058065479292993);

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
    // 상하 시점 고정 (좌우로만 회전)
    // controls.minPolarAngle = Math.PI / 2;
    // controls.maxPolarAngle = Math.PI / 2;
    // 초기 타겟 위치 설정
    controls.target.set(0, 0, 0);
    controlsRef.current = controls;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 10, 7.5);
    scene.add(directionalLight);

    const loader = new GLTFLoader();
    const modelPath = '/models/ccc.glb';
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
      // 캔버스에 원형 배경과 숫자 텍스트를 그리기
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      
      // 캔버스 크기 설정 (고해상도를 위해 큰 사이즈)
      const size = 128;
      canvas.width = size;
      canvas.height = size;
      
      // 반투명 파란색 원 그리기
      context.fillStyle = 'rgba(0, 191, 255, 0.8)'; // 반투명 파란색
      context.strokeStyle = 'rgba(255, 255, 255, 0.9)'; // 흰색 테두리
      context.lineWidth = 3;
      
      // 원 그리기
      const centerX = size / 2;
      const centerY = size / 2;
      const radius = size * 0.4;
      
      context.beginPath();
      context.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      context.fill();
      context.stroke();
      
      // 숫자 텍스트 그리기
      context.fillStyle = 'white';
      context.font = 'bold 48px Arial';
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText(pointData.baseText, centerX, centerY);
      
      // 텍스처 생성
      const texture = new THREE.CanvasTexture(canvas);
      texture.needsUpdate = true;
      
      // 스프라이트 재질 생성
      const spriteMaterial = new THREE.SpriteMaterial({ 
        map: texture,
        transparent: true,
        alphaTest: 0.1
      });
      
      // 스프라이트 생성
      const sprite = new THREE.Sprite(spriteMaterial);
      sprite.position.copy(pointData.position3D);
      sprite.scale.set(0.25, 0.25, 0.25); // 크기를 절반으로 줄임
      sprite.userData.id = pointData.id;
      sprite.userData.originalScale = 0.25; // 원래 크기 저장
      
      scene.add(sprite);
      return sprite;
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
        console.log('클릭된 3D 모델 좌표:', point);
        console.log('현재 카메라 위치:', camera.position);
        console.log('현재 카메라 회전:', camera.rotation);
      }
    };

    // 마우스 이동 이벤트 핸들러 (호버 효과)
    const onMouseMove = (event) => {
      if (!currentMount || !renderer || !camera) return;
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);

      // 포인트 호버 처리
      const intersects = raycaster.intersectObjects(pointMeshes);
      
      // 이전에 호버된 스프라이트가 있다면 원래 크기로 복원
      if (hoveredSprite && !intersects.find(intersect => intersect.object === hoveredSprite)) {
        const originalScale = hoveredSprite.userData.originalScale;
        hoveredSprite.scale.set(originalScale, originalScale, originalScale);
        hoveredSprite = null;
        document.body.style.cursor = 'default';
      }
      
      // 새로운 스프라이트에 호버 효과 적용
      if (intersects.length > 0) {
        const newHoveredSprite = intersects[0].object;
        if (newHoveredSprite !== hoveredSprite) {
          // 이전 호버 스프라이트 복원
          if (hoveredSprite) {
            const originalScale = hoveredSprite.userData.originalScale;
            hoveredSprite.scale.set(originalScale, originalScale, originalScale);
          }
          
          // 새로운 호버 스프라이트 확대
          hoveredSprite = newHoveredSprite;
          const hoverScale = hoveredSprite.userData.originalScale * 1.3; // 30% 확대
          hoveredSprite.scale.set(hoverScale, hoverScale, hoverScale);
          document.body.style.cursor = 'pointer';
        }
      }
    };

    if (renderer && renderer.domElement) {
      renderer.domElement.addEventListener('click', onClick);
      renderer.domElement.addEventListener('mousemove', onMouseMove);
    }

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      
      // WASD 키보드 조작 처리
      if (!isMovingToPoint && controlsRef.current) {
        const camera = controlsRef.current.object;
        const controls = controlsRef.current;
        
        // 이동 속도 설정
        const moveSpeed = 0.1;
        
        const currentKeys = keysRef.current;
        
        // 직선 이동 처리
        let moved = false;
        
        // 카메라의 현재 방향 벡터들 계산
        const forward = new THREE.Vector3();
        const right = new THREE.Vector3();
        
        // 카메라가 바라보는 방향 (forward)
        camera.getWorldDirection(forward);
        forward.y = 0; // Y축 성분 제거 (수평 이동만)
        forward.normalize();
        
        // 카메라 기준 오른쪽 방향 (right)
        right.crossVectors(forward, new THREE.Vector3(0, 1, 0));
        right.normalize();
        
        // W/↑: 카메라가 바라보는 방향으로 앞으로
        if (currentKeys.w || currentKeys.ArrowUp) {
          const movement = forward.clone().multiplyScalar(moveSpeed);
          camera.position.add(movement);
          controls.target.add(movement);
          moved = true;
        }
        
        // S/↓: 카메라가 바라보는 방향의 반대로 뒤로
        if (currentKeys.s || currentKeys.ArrowDown) {
          const movement = forward.clone().multiplyScalar(-moveSpeed);
          camera.position.add(movement);
          controls.target.add(movement);
          moved = true;
        }
        
        // A/←: 카메라 기준 왼쪽으로
        if (currentKeys.a || currentKeys.ArrowLeft) {
          const movement = right.clone().multiplyScalar(-moveSpeed);
          camera.position.add(movement);
          controls.target.add(movement);
          moved = true;
        }
        
        // D/→: 카메라 기준 오른쪽으로
        if (currentKeys.d || currentKeys.ArrowRight) {
          const movement = right.clone().multiplyScalar(moveSpeed);
          camera.position.add(movement);
          controls.target.add(movement);
          moved = true;
        }
      }
      
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
        renderer.domElement.removeEventListener('mousemove', onMouseMove);
      }
      // 호버 상태 정리
      if (hoveredSprite) {
        const originalScale = hoveredSprite.userData.originalScale;
        hoveredSprite.scale.set(originalScale, originalScale, originalScale);
        hoveredSprite = null;
      }
      document.body.style.cursor = 'default';
      
      if (controlsRef.current) controlsRef.current.dispose();
      pointMeshes.forEach(sprite => {
        scene.remove(sprite);
        if (sprite.material) {
          if (sprite.material.map) sprite.material.map.dispose();
          sprite.material.dispose();
        }
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
      <div 
        ref={mountRef} 
        tabIndex={0}
        style={{ 
          width: '100%', 
          height: 'calc(100vh - 150px)', 
          minHeight: '500px', 
          border: '1px solid #ccc', 
          position: 'relative',
          outline: 'none' // 포커스 아웃라인 제거
        }}
        onMouseDown={() => {
          // 클릭 시 포커스 설정
          if (mountRef.current) {
            mountRef.current.focus();
          }
        }}
      >
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
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          zIndex: 1000,
          overflow: 'hidden'
        }}>
          {/* 포인트 버튼들 */}
          <div style={{
            display: 'flex',
            gap: '8px',
            padding: '10px'
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
          
          {/* 키보드 조작 안내 */}
          <div style={{
            padding: '10px',
            borderTop: '1px solid #eee',
            fontSize: '12px',
            fontFamily: 'monospace',
            lineHeight: '1.4',
            color: '#333'
          }}>
            <div style={{ marginBottom: '4px', fontWeight: 'bold' }}>키보드 조작:</div>
            <div>W/↑:앞으로</div>
            <div>S/↓:뒤로</div>
            <div>A/←:왼쪽으로</div>
            <div>D/→:오른쪽으로</div>
            <div style={{ marginTop: '4px', fontSize: '11px', opacity: '0.7' }}>
              마우스: 시점 조작 및 줌
            </div>
          </div>
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