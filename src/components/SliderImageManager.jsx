import { useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronUp, ImagePlus, Trash2, X } from "lucide-react";
import {
  deleteSliderImage,
  fetchSliderImagesForAdmin,
  reorderSliderImages,
  updateSliderImage,
  uploadSliderImage,
} from "../api/sliderAPI";

function getErrorMessage(error, fallback) {
  return error.response?.data?.message || fallback;
}

function SliderImageManager({ onClose, onImagesChanged }) {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [altText, setAltText] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchSliderImagesForAdmin()
      .then(setImages)
      .catch((error) => alert(getErrorMessage(error, "이미지 목록을 불러오지 못했습니다.")))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleUpload = async (event) => {
    event.preventDefault();
    if (!selectedFile) return alert("업로드할 이미지를 선택해주세요.");

    try {
      setSaving(true);
      const created = await uploadSliderImage(selectedFile, altText);
      setImages((current) => [...current, created]);
      setSelectedFile(null);
      setAltText("");
      if (fileInputRef.current) fileInputRef.current.value = "";
      await onImagesChanged();
    } catch (error) {
      alert(getErrorMessage(error, "이미지 업로드에 실패했습니다."));
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (image) => {
    try {
      const updated = await updateSliderImage(image.id, { isActive: !image.is_active });
      setImages((current) => current.map((item) => item.id === image.id ? updated : item));
      await onImagesChanged();
    } catch (error) {
      alert(getErrorMessage(error, "노출 상태 변경에 실패했습니다."));
    }
  };

  const handleAltBlur = async (image, value) => {
    if (value === (image.alt_text || "")) return;
    try {
      const updated = await updateSliderImage(image.id, { altText: value });
      setImages((current) => current.map((item) => item.id === image.id ? updated : item));
      await onImagesChanged();
    } catch (error) {
      alert(getErrorMessage(error, "설명 수정에 실패했습니다."));
    }
  };

  const handleMove = async (index, offset) => {
    const target = index + offset;
    if (target < 0 || target >= images.length) return;
    const reordered = [...images];
    [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
    setImages(reordered);
    try {
      await reorderSliderImages(reordered.map((image) => image.id));
      await onImagesChanged();
    } catch (error) {
      setImages(images);
      alert(getErrorMessage(error, "순서 변경에 실패했습니다."));
    }
  };

  const handleDelete = async (image) => {
    if (!window.confirm("이 이미지를 삭제하시겠습니까?\n삭제한 이미지는 복구할 수 없습니다.")) return;
    try {
      await deleteSliderImage(image.id);
      setImages((current) => current.filter((item) => item.id !== image.id));
      await onImagesChanged();
    } catch (error) {
      alert(getErrorMessage(error, "이미지 삭제에 실패했습니다."));
    }
  };

  return (
    <div className="slider-manager-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="slider-manager" role="dialog" aria-modal="true" aria-labelledby="slider-manager-title">
        <div className="slider-manager-header">
          <div>
            <h3 id="slider-manager-title">메인 이미지 관리</h3>
            <p>켜진 이미지만 홈페이지에 아래 순서대로 표시됩니다.</p>
          </div>
          <button className="slider-manager-close" type="button" onClick={onClose} aria-label="닫기"><X size={22} /></button>
        </div>

        <form className="slider-upload-form" onSubmit={handleUpload}>
          <label className="slider-file-picker">
            <ImagePlus size={19} />
            <span>{selectedFile ? selectedFile.name : "새 이미지 선택"}</span>
            <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={(event) => setSelectedFile(event.target.files?.[0] || null)} />
          </label>
          <input type="text" maxLength={255} value={altText} onChange={(event) => setAltText(event.target.value)} placeholder="이미지 설명 (선택)" />
          <button type="submit" disabled={saving || !selectedFile}>{saving ? "업로드 중..." : "추가"}</button>
        </form>
        <p className="slider-upload-guide">JPG, PNG, WEBP, GIF · 최대 10MB · 가로형 이미지 권장</p>

        <div className="slider-manager-list">
          {loading && <p className="slider-manager-empty">불러오는 중...</p>}
          {!loading && images.length === 0 && (
            <p className="slider-manager-empty">등록된 이미지가 없어 기본 이미지 3장이 표시되고 있습니다.<br />새 이미지를 추가하면 관리자 설정으로 전환됩니다.</p>
          )}
          {images.map((image, index) => (
            <article className={`slider-manager-item ${image.is_active ? "" : "inactive"}`} key={image.id}>
              <img src={image.image_url} alt="" />
              <div className="slider-manager-item-info">
                <input
                  type="text"
                  defaultValue={image.alt_text || ""}
                  maxLength={255}
                  aria-label="이미지 설명"
                  onBlur={(event) => handleAltBlur(image, event.target.value)}
                />
                <span>{image.original_name || "슬라이더 이미지"}</span>
              </div>
              <label className="slider-visibility-toggle">
                <input type="checkbox" checked={image.is_active} onChange={() => handleToggle(image)} />
                <span>{image.is_active ? "표시" : "숨김"}</span>
              </label>
              <div className="slider-order-buttons">
                <button type="button" disabled={index === 0} onClick={() => handleMove(index, -1)} aria-label="위로"><ChevronUp size={18} /></button>
                <button type="button" disabled={index === images.length - 1} onClick={() => handleMove(index, 1)} aria-label="아래로"><ChevronDown size={18} /></button>
              </div>
              <button className="slider-delete-button" type="button" onClick={() => handleDelete(image)} aria-label="삭제"><Trash2 size={18} /></button>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

export default SliderImageManager;
