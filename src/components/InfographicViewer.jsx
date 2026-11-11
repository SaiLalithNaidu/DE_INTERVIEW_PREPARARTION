import React, { useState, useEffect, useRef } from 'react';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Maximize2, 
  Minimize2, 
  FileSpreadsheet, 
  Code2, 
  Database, 
  CheckCircle, 
  Star, 
  Terminal, 
  Cloud, 
  Layers,
  Sparkles,
  Download
} from 'lucide-react';
import { getImageBlob } from '../lib/store';

export default function InfographicViewer({ question }) {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [customImageSrc, setCustomImageSrc] = useState(null);
  const [loadingImage, setLoadingImage] = useState(false);
  const viewerRef = useRef(null);

  // Load custom image from IndexedDB if question has imageId
  useEffect(() => {
    let active = true;
    if (question?.imageId) {
      setLoadingImage(true);
      getImageBlob(question.imageId)
        .then((blobOrUrl) => {
          if (!active) return;
          if (blobOrUrl instanceof Blob) {
            const url = URL.createObjectURL(blobOrUrl);
            setCustomImageSrc(url);
          } else if (typeof blobOrUrl === 'string') {
            setCustomImageSrc(blobOrUrl);
          } else {
            setCustomImageSrc(null);
          }
          setLoadingImage(false);
        })
        .catch((err) => {
          console.error("Error loading image from IndexedDB", err);
          if (active) {
            setCustomImageSrc(null);
            setLoadingImage(false);
          }
        });
    } else {
      setCustomImageSrc(null);
    }
    return () => {
      active = false;
    };
  }, [question?.imageId]);

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.25, 2.5));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.25, 0.6));
  const handleResetZoom = () => setZoomLevel(1);
  const toggleFullscreen = () => setIsFullscreen((prev) => !prev);

  // Render vector graphic if no uploaded custom image
  const renderVectorInfographic = () => {
    const info = question.infographicData;
    if (!info) {
      return (
        <div className="default-infographic-card">
          <div className="infographic-banner">
            <div className="banner-icon">
              <Code2 size={28} />
            </div>
            <div>
              <span className="banner-badge">{question.difficulty || 'Concept'}</span>
              <h2 className="banner-title">{question.question}</h2>
            </div>
          </div>

          <div className="infographic-grid">
            <div className="info-block blue">
              <div className="block-header">
                <Star size={18} className="text-blue-500" />
                <h3>Core Concept</h3>
              </div>
              <p className="block-text">{question.shortAnswer}</p>
            </div>

            <div className="info-block green">
              <div className="block-header">
                <CheckCircle size={18} className="text-emerald-500" />
                <h3>Key Takeaways</h3>
              </div>
              <ul className="info-list">
                {question.takeaways?.map((t, idx) => (
                  <li key={idx}>
                    <span className="bullet-dot green-dot"></span>
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      );
    }

    // Specific tailored infographic layout (matches screenshot for Q1)
    const whatCard = info.cards?.find(c => c.id === 'what' || c.title?.includes('What is'));
    const whyCard = info.cards?.find(c => c.id === 'why' || c.title?.includes('Why'));
    const libCard = info.cards?.find(c => c.id === 'libraries');
    const exampleCard = info.cards?.find(c => c.id === 'example');
    const takeawaysCard = info.cards?.find(c => c.id === 'takeaways');

    return (
      <div className="infographic-sheet">
        {/* Top Header Banner */}
        <div className="infographic-hero-banner">
          <div className="hero-logo-wrap">
            <div className="python-brand-badge">
              <div className="py-circle blue-half"></div>
              <div className="py-circle yellow-half"></div>
            </div>
          </div>
          <div className="hero-text-wrap">
            <h2 className="hero-title">
              {info.title || question.question}
            </h2>
            <div className="hero-underline"></div>
          </div>
        </div>

        {/* 2-Column Top Cards */}
        <div className="infographic-row-top">
          {/* What is Python card */}
          {whatCard && (
            <div className="diagram-card card-blue">
              <div className="diagram-card-header">
                <div className="header-icon-circle blue-circle">
                  <Star size={16} />
                </div>
                <h4>{whatCard.title}</h4>
                <div className="header-tag-pill ml-auto">
                  <Terminal size={14} />
                </div>
              </div>
              <div className="diagram-card-body">
                <ul className="infographic-bullets">
                  {whatCard.bullets?.map((b, i) => (
                    <li key={i}>
                      <span className="star-icon">★</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Why used in Data Engineering card */}
          {whyCard && (
            <div className="diagram-card card-green">
              <div className="diagram-card-header">
                <div className="header-icon-circle green-circle">
                  <CheckCircle size={16} />
                </div>
                <h4>{whyCard.title}</h4>
                <div className="header-tag-pill ml-auto">
                  <Cloud size={14} />
                </div>
              </div>
              <div className="diagram-card-body">
                <ul className="infographic-bullets checkmark-list">
                  {whyCard.bullets?.map((b, i) => (
                    <li key={i}>
                      <span className="check-icon">✔</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* 3-Column Bottom Cards */}
        <div className="infographic-row-bottom">
          {/* Key Libraries */}
          {libCard && (
            <div className="diagram-card card-purple flex-1">
              <div className="diagram-card-header">
                <div className="header-icon-circle purple-circle">
                  <Layers size={16} />
                </div>
                <h4>{libCard.title}</h4>
              </div>
              <div className="diagram-card-body">
                <div className="libraries-grid">
                  {libCard.items?.map((item, idx) => (
                    <div key={idx} className="library-row">
                      <span className="lib-badge">{item.name}</span>
                      <span className="lib-desc">— {item.desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Real-time Pipeline Example */}
          {exampleCard && (
            <div className="diagram-card card-amber flex-1">
              <div className="diagram-card-header">
                <div className="header-icon-circle amber-circle">
                  <Sparkles size={16} />
                </div>
                <h4>{exampleCard.title}</h4>
              </div>
              <div className="diagram-card-body">
                <div className="pipeline-flow-diagram">
                  <div className="flow-step">
                    <div className="flow-icon-box green-box">
                      <FileSpreadsheet size={22} />
                    </div>
                    <span className="flow-title">Source</span>
                    <span className="flow-sub">(CSV / API)</span>
                  </div>

                  <div className="flow-arrow">
                    <div className="arrow-line"></div>
                    <span>➔</span>
                  </div>

                  <div className="flow-step">
                    <div className="flow-icon-box blue-box">
                      <Code2 size={22} />
                    </div>
                    <span className="flow-title">Python ETL</span>
                    <span className="flow-sub">(Clean, Transform)</span>
                  </div>

                  <div className="flow-arrow">
                    <div className="arrow-line"></div>
                    <span>➔</span>
                  </div>

                  <div className="flow-step">
                    <div className="flow-icon-box red-box">
                      <Database size={22} />
                    </div>
                    <span className="flow-title">AWS S3</span>
                    <span className="flow-sub">(Target Lakehouse)</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Key Takeaways */}
          {takeawaysCard && (
            <div className="diagram-card card-violet flex-1">
              <div className="diagram-card-header">
                <div className="header-icon-circle violet-circle">
                  <CheckCircle size={16} />
                </div>
                <h4>{takeawaysCard.title}</h4>
              </div>
              <div className="diagram-card-body">
                <ul className="infographic-bullets">
                  {takeawaysCard.bullets?.map((b, i) => (
                    <li key={i}>
                      <span className="target-dot">●</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer Illustrator Graphic */}
        <div className="infographic-developer-footer">
          <div className="footer-illustration">
            <span className="footer-tag">★ High-Yield Interview Concept</span>
          </div>
          <span className="footer-watermark">Data Engineer Interview Masterclass</span>
        </div>
      </div>
    );
  };

  return (
    <div className={`infographic-viewer-container ${isFullscreen ? 'fullscreen-mode' : ''}`}>
      {/* Top Toolbar */}
      <div className="viewer-toolbar">
        <div className="toolbar-info">
          <span className="badge-visual">Visual Infographic</span>
          <span className="zoom-indicator">{Math.round(zoomLevel * 100)}%</span>
        </div>
        <div className="toolbar-actions">
          <button 
            type="button" 
            className="tool-btn" 
            onClick={handleZoomOut} 
            title="Zoom Out"
            disabled={zoomLevel <= 0.6}
          >
            <ZoomOut size={16} />
          </button>
          <button 
            type="button" 
            className="tool-btn" 
            onClick={handleResetZoom} 
            title="Reset Zoom (100%)"
          >
            <RotateCcw size={15} />
          </button>
          <button 
            type="button" 
            className="tool-btn" 
            onClick={handleZoomIn} 
            title="Zoom In"
            disabled={zoomLevel >= 2.5}
          >
            <ZoomIn size={16} />
          </button>
          <div className="tool-divider"></div>
          <button 
            type="button" 
            className="tool-btn highlight" 
            onClick={toggleFullscreen} 
            title={isFullscreen ? "Exit Fullscreen" : "Full Screen Preview"}
          >
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
        </div>
      </div>

      {/* Main Zoomable Viewport */}
      <div className="viewer-viewport" ref={viewerRef}>
        <div 
          className="viewer-content-scaler"
          style={{ 
            transform: `scale(${zoomLevel})`,
            transformOrigin: 'top center',
            transition: 'transform 0.18s ease-out'
          }}
        >
          {loadingImage ? (
            <div className="loading-image-box">
              <div className="spinner"></div>
              <p>Loading infographic...</p>
            </div>
          ) : (customImageSrc || question?.imageUrl || question?.imageSrc) ? (
            <div className="custom-image-wrapper">
              <img 
                src={customImageSrc || question?.imageUrl || question?.imageSrc} 
                alt={question.question} 
                className="uploaded-infographic-img"
              />
            </div>
          ) : (
            renderVectorInfographic()
          )}
        </div>
      </div>
    </div>
  );
}

