import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { ImageIcon } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import "swiper/css";
import "swiper/css/navigation";

import "./imageslider.css";

import img1 from "../assets/images/EMSYS_Start.jpg";
import img3 from "../assets/images/EMSYS_Halloween.png";
import img2 from "../assets/images/EMSYS_Winter.jpg";
import { getUserRole } from "../utils/token";
import { fetchSliderImages } from "../api/sliderAPI";
import SliderImageManager from "./SliderImageManager";

const defaultImages = [
  { id: "default-1", image_url: img1, alt_text: "EMSYS 마스코트" },
  { id: "default-2", image_url: img2, alt_text: "EMSYS 겨울 배너" },
  { id: "default-3", image_url: img3, alt_text: "EMSYS 할로윈 배너" },
];

function ImageSlider() {
  const [images, setImages] = useState(defaultImages);
  const [managerOpen, setManagerOpen] = useState(false);
  const role = getUserRole();
  const canManage = role === "OFFICER" || role === "PRESIDENT";

  const loadImages = useCallback(async () => {
    try {
      const result = await fetchSliderImages();
      setImages(result.configured ? (result.data ?? []) : defaultImages);
    } catch (error) {
      console.error("슬라이더 이미지 조회 실패:", error);
      setImages(defaultImages);
    }
  }, []);

  useEffect(() => {
    fetchSliderImages()
      .then((result) => setImages(result.configured ? (result.data ?? []) : defaultImages))
      .catch((error) => {
        console.error("슬라이더 이미지 조회 실패:", error);
        setImages(defaultImages);
      });
  }, []);

  return (
    <header className="home-header">
      <div className="header-inner">
        {/* 배너 영역 */}
        <div className="header-left">
          {/* 슬라이더 */}
          {images.length > 0 ? <Swiper
            modules={[Navigation]}
            navigation={images.length > 1}
            loop={images.length > 1}
            slidesPerView={1}
            className="header-swiper"
          >
            {images.map((image) => (
              <SwiperSlide key={image.id}>
                <img src={image.image_url} alt={image.alt_text || "EMSYS 배너 이미지"} className="header-image" />
              </SwiperSlide>
            ))}
          </Swiper> : <div className="header-swiper-empty">표시할 배너 이미지가 없습니다.</div>}

          {/* 텍스트 */}
          <div className="header-right">
            <h2>
              충북대학교 소프트웨어 학술 동아리
              <br />
              EMSYS에 오신 것을 환영합니다!
            </h2>
          </div>

          {canManage && (
            <button className="slider-manage-button" type="button" onClick={() => setManagerOpen(true)}>
              <ImageIcon size={17} /> 이미지 변경
            </button>
          )}
        </div>
      </div>
      {managerOpen && <SliderImageManager onClose={() => setManagerOpen(false)} onImagesChanged={loadImages} />}
    </header>
  );
}

export default ImageSlider;
