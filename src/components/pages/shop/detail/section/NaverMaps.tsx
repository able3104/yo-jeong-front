import { useEffect, useRef } from "react";

const NaverMaps = () => {
  const mapElement = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const { naver } = window;
    if (!mapElement.current || !naver) return;

    // 부산시청 좌표로 직접 테스트 (Geocoder 미사용)
    const location = new naver.maps.LatLng(35.1795543, 129.0756416);

    const mapOptions = {
      center: location,
      zoom: 16,
    };

    const map = new naver.maps.Map(mapElement.current, mapOptions);

    new naver.maps.Marker({
      position: location,
      map: map,
    });
  }, []);

  return (
    <div className="w-full px-4 mb-8">
      <div 
        ref={mapElement} 
        className="w-full h-[250px] rounded-xl bg-gray-100" 
        style={{ minHeight: "250px" }}
      />
    </div>
  );
};

export default NaverMaps;