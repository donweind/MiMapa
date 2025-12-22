import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { 
  Upload, X, Image as ImageIcon, Map as MapIcon, Trash2, Loader2, MonitorPlay, 
  Type, Bold, Italic, ZoomIn, ZoomOut, Maximize, Download as DownloadIcon, 
  Save, FolderOpen, TriangleAlert, Flame, Zap, Skull, HeartPulse, DoorOpen, 
  Info, LayoutTemplate, Edit, Users, Lock, ShieldCheck, FileJson, Filter,
  Eye, EyeOff, LogOut, Settings, MousePointer2, CheckCircle2, Clock, AlertOctagon, FileImage, ArrowRight, Circle, FileText
} from 'lucide-react';

/* --- CURSORES PERSONALIZADOS (NEGROS) --- */
const cursorGrab = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewport='0 0 32 32' style='fill:black;stroke:white;stroke-width:1px;'><path d='M16.5,20.5 C16.5,20.5 16,16 16,14 C16,11 17,11 17,14 C17,16 17.5,16 17.5,16 C17.5,16 17.5,12 18,11 C18.5,10 19.5,10 19.5,11 C19.5,13 19.5,16 19.5,16 C19.5,16 20,13 20.5,12 C21,11 22,11 22,12 C22,13 22,16 22,16 C22,16 23,14 23.5,14 C24.5,14 25,15 25,16 C25,22 22,26 19,28 C16,30 12,28 11,24 C10,20 12,20 13,20 C13,20 12.5,16 12.5,13 C12.5,10 13.5,10 14,11 C14.5,12 14.5,15 14.5,16 C14.5,16 14.5,13 15,12 C15.5,11 16.5,11 16.5,12 C16.5,13 16.5,16 16.5,16 L16.5,20.5 Z' fill='black' stroke='white' stroke-width='1.5'/></svg>") 16 16, grab`;

const cursorGrabbing = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewport='0 0 32 32' style='fill:black;stroke:white;stroke-width:1px;'><path d='M16.5,20.5 C16.5,20.5 16,16 16,14 C16,11 17,11 17,14 C17,16 17.5,16 17.5,16 C17.5,16 17.5,12 18,11 C18.5,10 19.5,10 19.5,11 C19.5,13 19.5,16 19.5,16 C19.5,16 20,13 20.5,12 C21,11 22,11 22,12 C22,13 22,16 22,16 C22,16 23,14 23.5,14 C24.5,14 25,15 25,16 C25,22 22,26 19,28 C16,30 12,28 11,24 C10,20 12,20 13,20 C13,20 12.5,16 12.5,13 C12.5,10 13.5,10 14,11 C14.5,12 14.5,15 14.5,16 C14.5,16 14.5,13 15,12 C15.5,11 16.5,11 16.5,12 C16.5,13 16.5,16 16.5,16 L16.5,20.5 Z' fill='black' stroke='white' stroke-width='1.5' transform='translate(0, 2) scale(0.9)'/></svg>") 16 16, grabbing`;

/* --- CONFIGURACIÓN & CONSTANTES --- */

const generatePalette = (hue, saturation) => 
  Array.from({ length: 6 }).map((_, i) => `hsl(${hue}, ${saturation}%, ${90 - (i * 12)}%)`);

const PRIMARY_PALETTES = {
  'Rojos': generatePalette(0, 85),
  'Azules': generatePalette(220, 90),
  'Amarillos': generatePalette(45, 95),
  'Grises / Negro': generatePalette(0, 0),
};

const MATTE_PALETTE_TEXT = ['#64748b', '#78716c', '#57534e', '#475569', '#334155', '#0f172a'];

const RECT_PALETTES = {
  'Verde Monocromo': ['#dcfce7', '#bbf7d0', '#86efac', '#4ade80', '#22c55e', '#16a34a'],
  'Amarillo Monocromo': ['#fef9c3', '#fef08a', '#fde047', '#facc15', '#eab308', '#ca8a04'],
};

const MATTE_OPTIONS = {
  light: ['#e2e8f0', '#cbd5e1', '#d1fae5', '#dbeafe', '#fae8ff', '#fef3c7'],
  dark: ['#0f172a', '#334155', '#064e3b', '#1e3a8a', '#581c87', '#78350f']
};

const MARKER_STYLES = {
  green: { bg: '#16a34a', text: '#ffffff', border: 'none', radius: '0px' }, 
  yellow: { bg: '#facc15', text: '#000000', border: 'none', radius: '0px' },
  dotted: { bg: 'transparent', text: '#000000', border: '2px dotted', radius: '50%' } 
};

const SAFETY_ICONS = {
  'warning': { icon: TriangleAlert, label: 'Advertencia', defaultColor: '#eab308', bg: '#fef9c3' },
  'fire': { icon: Flame, label: 'Incendio', defaultColor: '#dc2626', bg: '#fee2e2' },
  'electric': { icon: Zap, label: 'Alto Voltaje', defaultColor: '#ca8a04', bg: '#fef08a' },
  'danger': { icon: Skull, label: 'Peligro Mortal', defaultColor: '#000000', bg: '#f3f4f6' },
  'medical': { icon: HeartPulse, label: 'Primeros Auxilios', defaultColor: '#16a34a', bg: '#dcfce7' },
  'exit': { icon: DoorOpen, label: 'Salida', defaultColor: '#15803d', bg: '#dcfce7' },
  'info': { icon: Info, label: 'Información', defaultColor: '#2563eb', bg: '#dbeafe' },
};

const BASE_MARKER_SIZE_PX = 24; 

/* --- COMPONENTES EXTRAÍDOS --- */

// Componente Wrapper para manejar eventos comunes y Doble Click
const ElementWrapper = React.memo(({ children, point, isSelected, readOnly, onMouseDown, onDoubleClick }) => {
  return (
    <div 
      onMouseDown={(e) => {
        if (!readOnly) {
            e.stopPropagation(); 
            onMouseDown(e, point.id);
        }
      }} 
      onDoubleClick={(e) => {
        e.stopPropagation(); 
        onDoubleClick(e, point.id);
      }}
      onClick={(e) => {
          e.stopPropagation();
          // Si es solo lectura, el click simple sirve para seleccionar/ver popup
          if(readOnly) onDoubleClick(e, point.id); 
      }}
      className={`absolute flex items-center justify-center select-none z-20 transition-transform duration-200 
        ${isSelected ? 'z-30 scale-110 ring-2 ring-blue-500 rounded-lg' : ''}`}
      style={{ 
        left: `${point.x}%`, 
        top: `${point.y}%`,
        transform: 'translate(-50%, -50%)' 
      }}
    >
      {/* ELIMINADO: Indicador de Estado (Punto de color pequeño) */}
      {children}
    </div>
  );
});

const SafetyElement = React.memo(({ point, isSelected, readOnly, onMouseDown, onDoubleClick }) => {
  const config = SAFETY_ICONS[point.safetyType] || SAFETY_ICONS.warning;
  const IconComponent = config.icon;
  const size = 32 * (point.scaleX || 1); 

  return (
   <ElementWrapper point={point} isSelected={isSelected} readOnly={readOnly} onMouseDown={onMouseDown} onDoubleClick={onDoubleClick}>
     {point.safetyType === 'custom' && point.customSafetyIcon ? (
         <div style={{ width: `${size}px`, height: `${size}px` }} className="relative">
             <img src={point.customSafetyIcon} className="w-full h-full object-contain drop-shadow-sm" alt="custom safety" />
         </div>
     ) : (
         <div className="flex items-center justify-center rounded-full shadow-md transition-shadow duration-300"
             style={{
                 backgroundColor: point.markerColor || config.bg, 
                 color: point.textColor || config.defaultColor, 
                 width: `${size}px`, height: `${size}px`,
                 border: `2px solid ${point.textColor || config.defaultColor}`
             }}> 
         <IconComponent size={size * 0.6} strokeWidth={2.5} />
         </div>
     )}
   </ElementWrapper>
  );
});

const MarkerElement = React.memo(({ point, isSelected, readOnly, onMouseDown, onDoubleClick }) => {
  const config = point.style === 'dotted-black' ? MARKER_STYLES.dotted : MARKER_STYLES[point.style] || MARKER_STYLES.green;
  const isDotted = point.style === 'dotted-black';
  const displayBg = isDotted ? (point.markerColor || MATTE_OPTIONS.light[0]) : (point.markerColor || config.bg);
  const displayText = point.textColor || config.text;
  
  const containerStyle = isDotted ? {
    backgroundColor: displayBg, color: displayText, border: `2px dotted ${displayText}`, width: `${BASE_MARKER_SIZE_PX}px`, height: `${BASE_MARKER_SIZE_PX}px`, borderRadius: '50%', whiteSpace: 'nowrap'
  } : {
    backgroundColor: point.markerColor || config.bg, color: point.textColor || config.text, width: `${BASE_MARKER_SIZE_PX}px`, height: `${BASE_MARKER_SIZE_PX}px`, borderRadius: config.radius, border: config.border, boxShadow: isSelected ? '0 10px 15px rgba(0,0,0,0.3)' : '0 4px 6px rgba(0,0,0,0.1)', whiteSpace: 'nowrap'
  };

  const fontSize = point.markerFontSize || 10;

  return (
    <ElementWrapper point={point} isSelected={isSelected} readOnly={readOnly} onMouseDown={onMouseDown} onDoubleClick={onDoubleClick}>
      <div style={{ transform: `scale(${point.scaleX || 1}, ${point.scaleY || 1})` }}>
        <div className="flex items-center justify-center font-bold overflow-hidden shadow-sm transition-shadow duration-300" 
             style={{...containerStyle, fontSize: `${fontSize}px`}}> 
          <span style={{ transform: `scale(${1/(point.scaleX || 1)}, ${1/(point.scaleY || 1)})`, padding: '0 2px', display: 'inline-block' }}>{point.label}</span>
        </div>
      </div>
    </ElementWrapper>
  );
});

const TextElement = React.memo(({ point, isSelected, readOnly, onMouseDown, onDoubleClick }) => {
  const fonts = { 'sans': 'font-sans', 'serif': 'font-serif', 'mono': 'font-mono' };
  return (
    <ElementWrapper point={point} isSelected={isSelected} readOnly={readOnly} onMouseDown={onMouseDown} onDoubleClick={onDoubleClick}>
      <div 
        className={`whitespace-nowrap transition-all duration-200 ${fonts[point.fontFamily || 'sans']} ${point.isBold ? 'font-bold' : ''} ${point.isItalic ? 'italic' : ''}`}
        style={{ fontSize: `${point.fontSize}px`, color: point.color, textShadow: '0 1px 2px rgba(255,255,255,0.8)' }}>
        {point.label}
      </div>
    </ElementWrapper>
  );
});

const Popup = React.memo(({ point, onClose }) => {
  const isRightHalf = point.x > 50;
  
  const style = {
    position: 'absolute', 
    zIndex: 100, 
    width: '380px', 
    [isRightHalf ? 'right' : 'left']: isRightHalf ? `${100 - point.x + 1.5}%` : `${point.x + 1.5}%`,
    top: `${point.y}%`, 
    transform: 'translate(0, -50%)'
  };

  // Status Labels map
  const statusLabels = {
      'executed': { text: 'EJECUTADO', bg: 'bg-green-100', textC: 'text-green-700', border: 'border-green-300' },
      'process': { text: 'EN PROCESO', bg: 'bg-orange-100', textC: 'text-orange-700', border: 'border-orange-300' },
      'delayed': { text: 'ATRASADO', bg: 'bg-red-100', textC: 'text-red-700', border: 'border-red-300' },
      'pending': { text: 'PENDIENTE', bg: 'bg-gray-100', textC: 'text-gray-700', border: 'border-gray-300' },
  };
  const statusConfig = point.status ? statusLabels[point.status] : null;

  return (
    <div 
      className="bg-white rounded-xl shadow-2xl p-0 overflow-hidden animate-in fade-in zoom-in duration-200 border border-gray-100 flex flex-col" 
      style={style}
      onMouseDown={(e) => e.stopPropagation()} 
      onClick={(e) => e.stopPropagation()}
    >
      <div className="bg-gray-50 px-4 py-3 border-b flex justify-between items-center">
        <div className="flex flex-col gap-1">
            <h3 className="font-bold text-gray-800 text-sm truncate pr-2 max-w-[250px]">{point.title}</h3>
            <div className="flex gap-2">
                {point.priority && <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${point.priority === 'A' ? 'bg-red-50 text-red-600 border-red-200' : point.priority === 'B' ? 'bg-yellow-50 text-yellow-600 border-yellow-200' : 'bg-green-50 text-green-600 border-green-200'}`}>PRIORIDAD {point.priority}</span>}
                {statusConfig && <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${statusConfig.bg} ${statusConfig.textC} ${statusConfig.border}`}>{statusConfig.text}</span>}
            </div>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-red-50">
          <X size={16} />
        </button>
      </div>
      
      {point.image ? (
        <div className="relative h-80 bg-gray-100">
           <img src={point.image} alt={point.title} className="w-full h-full object-cover" />
           <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
        </div>
      ) : (
        <div className="h-24 bg-gray-50 flex items-center justify-center text-gray-300">
          <ImageIcon size={32} />
        </div>
      )}
      
      <div className="p-4 bg-white">
         <p className="text-sm text-gray-600 leading-relaxed">
           {point.description || <span className="italic text-gray-400">Sin descripción disponible.</span>}
         </p>
      </div>
    </div>
  );
});

/* --- APP PRINCIPAL --- */

export default function App() {
  /* --- ESTADOS DEL SISTEMA --- */
  const [currentScreen, setCurrentScreen] = useState('landing');
  const [isAdmin, setIsAdmin] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState(false);
  const [adminPreviewMode, setAdminPreviewMode] = useState(false);

  /* --- ESTADOS DEL MAPA --- */
  const [mapImage, setMapImage] = useState(null);
  const [points, setPoints] = useState([]);
  const [selectedPointId, setSelectedPointId] = useState(null);
  const [tool, setTool] = useState('marker'); 
  const [filterPriority, setFilterPriority] = useState('ALL'); 
  
  const [matteShade, setMatteShade] = useState('light');
  const [draggingElementId, setDraggingElementId] = useState(null); 
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });

  const [isProcessingPDF, setIsProcessingPDF] = useState(false);
  const [showBulkImportModal, setShowBulkImportModal] = useState(false);
  const [bulkImportText, setBulkImportText] = useState('');
  
  const mapRef = useRef(null);
  const imgRef = useRef(null);
  const containerRef = useRef(null); 
  const fileInputRef = useRef(null); // Para cargar JSON
  const mapInputRef = useRef(null); // Para cargar Nueva Imagen de Mapa
  const jsonInputRef = useRef(null);

  useEffect(() => {
    if (!window.pdfjsLib) {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
        script.onload = () => {
          window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        };
        document.body.appendChild(script);
    }
  }, []);

  /* --- LÓGICA DE NAVEGACIÓN Y LOGIN --- */
  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (password === '112358') {
      setIsAdmin(true);
      setCurrentScreen('editor');
      setLoginError(false);
      setPassword('');
      setAdminPreviewMode(false);
    } else {
      setLoginError(true);
    }
  };

  const handleFabricationEntry = () => {
    setIsAdmin(false);
    if (mapImage) {
        setCurrentScreen('fabrication_view');
        setZoom(1); 
        setPan({x:0, y:0});
    } else {
        setCurrentScreen('fabrication_load');
        setPoints([]); 
    }
  };

  const handleExitToLanding = () => {
    setCurrentScreen('landing');
    setIsAdmin(false); 
    setZoom(1);
    setPan({x:0, y:0});
    setFilterPriority('ALL');
  };

  const handleCloseProject = () => {
      // Limpia el mapa y los puntos, pero se mantiene en la pantalla de edición
      // permitiendo volver a subir un archivo.
      if(window.confirm("¿Estás seguro de cerrar el proyecto? Se borrarán el mapa y los puntos actuales.")) {
          setMapImage(null);
          setPoints([]);
          setSelectedPointId(null);
          // NO llamamos a handleExitToLanding(), nos quedamos en 'editor'
      }
  };

  /* --- LOGICA IMPORTACION MASIVA --- */
  const handleBulkProcess = () => {
      if (!bulkImportText.trim()) return;
      
      const lines = bulkImportText.split('\n');
      const newPoints = lines.map((line, index) => {
          // Intentar separar por tabuladores (Excel) o comas
          let parts;
          if (line.includes('\t')) {
              parts = line.split('\t');
          } else {
              parts = line.split(/[,;]+/).map(s => s.trim());
          }
          
          // Mínimo necesitamos el ID/Número
          if (parts.length < 1 || !parts[0]) return null;

          const labelRaw = parts[0]?.trim() || ''; // Ej: "LDA 77"
          const prioRaw = parts[1]?.trim().toUpperCase() || 'C'; // Ej: "B"
          // Descripción es todo lo que queda
          const descRaw = parts.length > 2 ? parts.slice(2).join(' ').trim() : ''; 

          // Validar prioridad
          const finalPrio = ['A','B','C'].includes(prioRaw) ? prioRaw : 'C';

          // Detectar si es LDA o FC para aplicar estilos
          const isLDA = labelRaw.toUpperCase().includes('LDA');
          const isFC = labelRaw.toUpperCase().includes('FC');
          
          let pointConfig = {
              style: 'green',
              markerColor: MARKER_STYLES.green.bg,
              scaleX: 1, 
              scaleY: 1, 
              markerFontSize: 10,
              textColor: '#ffffff'
          };

          if (isLDA) {
              pointConfig = {
                  style: 'green',
                  markerColor: MARKER_STYLES.green.bg,
                  scaleX: 3,        // Estándar 2
                  scaleY: 1.1,      
                  markerFontSize: 20, 
                  textColor: '#ffffff'
              };
          } else if (isFC) {
               pointConfig = {
                  style: 'yellow',
                  markerColor: RECT_PALETTES['Amarillo Monocromo'][2], // Tono 3 (#fde047)
                  scaleX: 3,        // Estándar 2
                  scaleY: 1.1,
                  markerFontSize: 20,
                  textColor: '#000000'
              };
          }

          return {
              id: Date.now() + index,
              // Organizar en cuadrícula inicial
              x: 5 + (index % 10) * 5, 
              y: 10 + Math.floor(index / 10) * 5,
              title: descRaw || "Sin descripción", // Título del popup = Descripción
              label: labelRaw, // Texto del marcador = Número (LDA/FC XX)
              priority: finalPrio,
              description: descRaw, 
              type: 'marker',
              status: 'pending',
              ...pointConfig
          };
      }).filter(p => p !== null);

      setPoints(prev => [...prev, ...newPoints]);
      setBulkImportText('');
      setShowBulkImportModal(false);
      alert(`Se han importado ${newPoints.length} puntos. Aparecerán en la esquina superior izquierda.`);
  };

  /* --- GESTIÓN DE ARCHIVOS --- */
  const processFile = async (file) => {
    if (file.type === 'application/pdf') {
      setIsProcessingPDF(true);
      try {
        if (!window.pdfjsLib) throw new Error("PDF Lib not ready");
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const page = await pdf.getPage(1); 
        const viewport = page.getViewport({ scale: 2.0 }); 
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        await page.render({ canvasContext: context, viewport: viewport }).promise;
        setMapImage(canvas.toDataURL('image/png'));
        setPan({x: 0, y: 0});
        setZoom(1);
      } catch (error) {
        alert("Error al procesar PDF. Intente nuevamente.");
      } finally { setIsProcessingPDF(false); }
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        setMapImage(e.target.result);
        setPan({x: 0, y: 0});
        setZoom(1);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileUpload = (e, callback) => {
      const file = e.target.files[0];
      if (!file) return;
      if (callback) {
          const reader = new FileReader();
          reader.onload = (ev) => callback(ev.target.result);
          reader.readAsDataURL(file);
      } else {
          processFile(file);
      }
  };

  /* --- IMPORTAR / EXPORTAR --- */
  const handleExportProject = () => {
    if (!mapImage) return alert("No hay un mapa para exportar.");
    const dataStr = JSON.stringify({ version: "1.0", timestamp: new Date().toISOString(), mapImage, points, view: { zoom, pan } });
    const link = document.createElement('a');
    link.href = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    link.download = `mapa_proyecto_${new Date().toLocaleDateString().replace(/\//g, '-')}.json`;
    link.click();
  };

  const handleImportProject = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
        try {
            const data = JSON.parse(ev.target.result);
            if (!data.mapImage) throw new Error("Archivo inválido.");
            setMapImage(data.mapImage);
            setPoints(data.points || []);
            if (data.view) { setZoom(data.view.zoom || 1); setPan(data.view.pan || { x: 0, y: 0 }); }
            
            if (currentScreen === 'fabrication_load') {
              setCurrentScreen('fabrication_view');
            } else {
              alert("Proyecto cargado exitosamente.");
            }
        } catch { alert("Error al leer el archivo JSON."); }
    };
    reader.readAsText(file);
    e.target.value = null;
  };

  const handleDownloadMap = async () => {
    if (!mapImage || !imgRef.current) return;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    const loadImage = (src) => new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
    });

    try {
        const bgImg = await loadImage(mapImage);
        const { naturalWidth, naturalHeight, width: displayWidth } = imgRef.current;
        const scaleRatio = naturalWidth / displayWidth;

        canvas.width = naturalWidth;
        canvas.height = naturalHeight;
        ctx.drawImage(bgImg, 0, 0);
        
        for (const p of points) {
            if (filterPriority !== 'ALL' && p.priority !== filterPriority) continue;

            const x = (p.x / 100) * naturalWidth;
            const y = (p.y / 100) * naturalHeight;
            ctx.save();
            ctx.translate(x, y);
            
            if (p.type === 'text') {
                const fontSize = (p.fontSize || 14) * scaleRatio;
                ctx.font = `${p.isItalic?'italic':''} ${p.isBold?'bold':''} ${fontSize}px ${p.fontFamily==='mono'?'monospace':p.fontFamily==='serif'?'serif':'sans-serif'}`;
                ctx.fillStyle = p.color || '#000';
                ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
                ctx.fillText(p.label, 0, 0);
            } else if (p.type === 'safety') {
                const s = 32 * scaleRatio * (p.scaleX || 1);
                const conf = SAFETY_ICONS[p.safetyType] || SAFETY_ICONS.warning;
                if (p.safetyType === 'custom' && p.customSafetyIcon) {
                    try {
                        const icon = await loadImage(p.customSafetyIcon);
                        ctx.drawImage(icon, -s/2, -s/2, s, s);
                    } catch { ctx.fillStyle='#ccc'; ctx.fillRect(-s/2,-s/2,s,s); }
                } else {
                    ctx.fillStyle = p.markerColor || conf.bg;
                    ctx.beginPath(); ctx.arc(0, 0, s/2, 0, 2*Math.PI); ctx.fill();
                    ctx.fillStyle = conf.defaultColor;
                    ctx.font = `bold ${s*0.6}px sans-serif`;
                    ctx.textAlign='center'; ctx.textBaseline='middle';
                    ctx.fillText('!', 0, 0);
                }
            } else {
                const s = BASE_MARKER_SIZE_PX * scaleRatio;
                const w = s * (p.scaleX||1), h = s * (p.scaleY||1);
                const conf = p.style==='dotted-black' ? MARKER_STYLES.dotted : MARKER_STYLES[p.style]||MARKER_STYLES.green;
                const isCircle = p.style==='dotted-black';
                
                if (isCircle) {
                    ctx.beginPath(); ctx.ellipse(0,0,w/2,h/2,0,0,2*Math.PI);
                    ctx.fillStyle = p.markerColor||'transparent'; ctx.fill();
                    if (p.style==='dotted-black') {
                        ctx.strokeStyle = p.textColor||'#000'; ctx.lineWidth=2*scaleRatio;
                        ctx.setLineDash([3*scaleRatio,3*scaleRatio]); ctx.stroke();
                    }
                } else {
                    ctx.fillStyle = p.markerColor||conf.bg; ctx.fillRect(-w/2,-h/2,w,h);
                }
                const fs = (p.markerFontSize||10) * scaleRatio;
                ctx.font = `bold ${fs}px sans-serif`;
                ctx.fillStyle = p.textColor||'#fff';
                ctx.textAlign='center'; ctx.textBaseline='middle';
                ctx.fillText(p.label, 0, 0);
            }
            ctx.restore();
        }
        
        const link = document.createElement('a');
        link.download = 'mapa_exportado.jpg'; 
        link.href = canvas.toDataURL('image/jpeg', 0.9); 
        link.click();
    } catch { alert("Error al exportar la imagen."); }
  };

  /* --- HELPERS DE ESTADO --- */
  const updatePoint = (id, field, value) => setPoints(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
  const deletePoint = (id) => { setPoints(prev => prev.filter(p => p.id !== id)); setSelectedPointId(null); };

  const clampPan = useCallback((proposedPan, currentZoom) => {
    if (!containerRef.current || !imgRef.current) return proposedPan;
    const { clientWidth: cW, clientHeight: cH } = containerRef.current;
    const iW = imgRef.current.clientWidth * currentZoom;
    const iH = imgRef.current.clientHeight * currentZoom;

    if (iW <= cW && iH <= cH) return { x: (cW - iW)/2, y: (cH - iH)/2 };

    const minX = iW > cW ? cW - iW : (cW - iW)/2;
    const maxX = iW > cW ? 0 : minX;
    const minY = iH > cH ? cH - iH : (cH - iH)/2;
    const maxY = iH > cH ? 0 : minY;

    return { x: Math.min(Math.max(proposedPan.x, minX), maxX), y: Math.min(Math.max(proposedPan.y, minY), maxY) };
  }, []);

  /* --- EVENT HANDLERS INTERFAZ --- */
  const handleZoom = (delta) => {
      setZoom(z => {
          const next = Math.min(Math.max(z + delta, 0.2), 8);
          // Standard center zoom for buttons
          requestAnimationFrame(() => setPan(p => clampPan(p, next)));
          return next;
      });
  };
  
  const handleResetView = () => { setZoom(1); requestAnimationFrame(() => setPan(clampPan({x:0,y:0}, 1))); };
  
  // ZOOM TO CURSOR LOGIC (UPDATED)
  const handleWheel = (e) => {
      if (!mapImage || !containerRef.current) return;
      
      e.preventDefault(); // Prevent default scroll

      const rect = containerRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const delta = e.deltaY * -0.001;
      const nextZoom = Math.min(Math.max(zoom + delta, 0.2), 8);

      // Calcular la posición del mouse relativa al mundo (antes del zoom)
      // mouseX = panX + worldX * zoom
      // worldX = (mouseX - panX) / zoom
      const worldX = (mouseX - pan.x) / zoom;
      const worldY = (mouseY - pan.y) / zoom;

      // Calcular nueva posición de paneo para mantener el punto bajo el mouse estático
      // newPanX = mouseX - worldX * nextZoom
      const newPanX = mouseX - worldX * nextZoom;
      const newPanY = mouseY - worldY * nextZoom;

      setZoom(nextZoom);
      setPan(clampPan({ x: newPanX, y: newPanY }, nextZoom));
  };

  const handleMouseDown = useCallback((e, id) => {
      if (isAdmin && !adminPreviewMode) { 
          setDraggingElementId(id);
      }
  }, [isAdmin, adminPreviewMode]);

  const handleDoubleClick = useCallback((e, id) => {
      if (!isPanning) setSelectedPointId(id); 
  }, [isPanning]);

  // Manejo global de Drag & Pan
  useEffect(() => {
    const onMove = (e) => {
      if (isPanning) {
          e.preventDefault();
          setPan(p => clampPan({ x: e.clientX - startPan.x, y: e.clientY - startPan.y }, zoom));
      } else if (draggingElementId && mapRef.current && isAdmin && !adminPreviewMode) { 
          e.preventDefault();
          const r = mapRef.current.getBoundingClientRect();
          const x = Math.max(0, Math.min(100, ((e.clientX - r.left) / r.width) * 100));
          const y = Math.max(0, Math.min(100, ((e.clientY - r.top) / r.height) * 100));
          setPoints(prev => prev.map(p => p.id === draggingElementId ? { ...p, x, y } : p));
      }
    };
    const onUp = () => { setIsPanning(false); setDraggingElementId(null); };
    
    if (isPanning || draggingElementId) {
        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onUp);
    }
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
  }, [isPanning, draggingElementId, startPan, zoom, clampPan, isAdmin, adminPreviewMode]);

  useEffect(() => { if (mapImage) setPan(p => clampPan(p, zoom)); }, [mapImage, zoom, clampPan]);

  const handleMapDoubleClick = (e) => {
    if (!isAdmin || adminPreviewMode || !mapImage || isPanning || draggingElementId) return; 
    const r = mapRef.current.getBoundingClientRect();
    const nextNum = points.filter(p => p.type === 'marker').length + 1;
    // Default Priority A, Status Process
    const base = { id: Date.now(), x: ((e.clientX-r.left)/r.width)*100, y: ((e.clientY-r.top)/r.height)*100, title: `Punto ${nextNum}`, image: null, description: '', priority: 'A', status: 'process' };
    
    let newItem;
    if (tool === 'safety') {
        newItem = { ...base, type: 'safety', label: '!', safetyType: 'warning', scaleX: 1.5, scaleY: 1.5, markerColor: SAFETY_ICONS.warning.bg, textColor: SAFETY_ICONS.warning.defaultColor, title: 'Señal de Seguridad' };
    } else if (tool === 'text') {
        newItem = { ...base, type: 'text', label: 'Texto', fontSize: 14, fontFamily: 'sans', isBold: true, isItalic: false, color: '#1f2937' };
    } else {
        newItem = { ...base, type: 'marker', label: `${nextNum}`, style: 'green', scaleX: 1, scaleY: 1, markerFontSize: 10, textColor: '#ffffff', markerColor: MARKER_STYLES.green.bg };
    }
    setPoints([...points, newItem]); setSelectedPointId(newItem.id);
  };

  const visiblePoints = points.filter(p => filterPriority === 'ALL' || p.priority === filterPriority);

  /* --- RENDERS --- */

  // 1. LANDING (Minimalista)
  if (currentScreen === 'landing') {
    return (
      <div className="flex flex-col h-screen w-screen bg-gray-50 relative overflow-hidden">
        
        {/* FABRICATION SECTION (Main Content - 95%) */}
        <div 
          onClick={handleFabricationEntry}
          className="flex-1 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors group"
        >
          <div className="text-center space-y-6 animate-in fade-in zoom-in duration-700">
             <div className="w-24 h-24 bg-black text-white rounded-full flex items-center justify-center mx-auto shadow-2xl group-hover:scale-110 transition-transform">
                <Users size={48} />
             </div>
             <div>
               <h1 className="text-5xl font-black tracking-tighter text-gray-900 mb-2">MAPA DE OPERACIONES</h1>
               <p className="text-xl text-gray-500 tracking-[0.3em] font-light uppercase">Ingreso a Fabricación</p>
             </div>
             <div className="opacity-0 group-hover:opacity-100 transition-opacity text-sm font-bold text-gray-400 mt-4">
                Haga clic en cualquier lugar para entrar
             </div>
          </div>
        </div>

        {/* ADMIN SECTION (Corner - 5%) */}
        <div 
          onClick={() => setCurrentScreen('admin_login')}
          className="absolute bottom-6 right-6 z-50 p-3 text-gray-300 hover:text-gray-900 transition-colors cursor-pointer"
          title="Administrador"
        >
          <ShieldCheck size={24} />
        </div>

        {/* FOOTER */}
        <div className="absolute bottom-4 left-0 right-0 text-center pointer-events-none">
          <p className="text-[10px] text-gray-400 font-serif tracking-widest">Creado por Elias Dolores para la MP1-CAÑETE</p>
        </div>

      </div>
    );
  }

  // 2. LOGIN ADMIN (Minimalista)
  if (currentScreen === 'admin_login') {
    return (
      <div className="flex h-screen bg-gray-50 items-center justify-center p-4">
        <div className="bg-white p-10 rounded-xl shadow-lg w-full max-w-sm relative border border-gray-100">
          <button onClick={() => setCurrentScreen('landing')} className="absolute top-4 right-4 text-gray-400 hover:text-black transition-colors"><X size={20}/></button>
          
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-black text-white mb-4"><Lock size={18} /></div>
            <h2 className="text-xl font-bold text-gray-900">Acceso Restringido</h2>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-6">
            <div>
              <input type="password" autoFocus className={`w-full border-b-2 bg-transparent px-2 py-3 text-center text-xl tracking-widest outline-none focus:border-black transition-colors ${loginError ? 'border-red-500 text-red-600' : 'border-gray-200 text-gray-800'}`} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="• • • • • •" />
              {loginError && <p className="text-red-500 text-xs mt-2 text-center font-medium">Clave incorrecta</p>}
            </div>
            <button type="submit" className="w-full bg-black text-white font-bold py-3 rounded-lg hover:bg-gray-800 transition-colors">Ingresar</button>
          </form>
        </div>
      </div>
    );
  }

  // 3. CARGA FABRICACIÓN (Minimalista - Dark Theme)
  if (currentScreen === 'fabrication_load') {
    return (
      <div className="flex h-screen bg-gray-950 text-white items-center justify-center p-6 relative">
        <button onClick={handleExitToLanding} className="absolute top-8 left-8 flex items-center gap-2 text-gray-500 hover:text-white transition-colors text-sm font-medium tracking-wide"><X size={18}/> CANCELAR</button>
        
        <div className="max-w-xl w-full text-center">
          <h1 className="text-3xl font-bold tracking-tight mb-2">FABRICACIÓN</h1>
          <p className="text-gray-500 tracking-widest text-sm uppercase mb-12">Carga de Mapa Operativo</p>

          <div className="flex flex-col gap-4">
             {/* Opción Cargar JSON */}
             <div onClick={() => jsonInputRef.current?.click()} className="group cursor-pointer bg-white/5 border border-white/10 hover:border-white/30 rounded-xl p-8 transition-all hover:bg-white/10 flex flex-col items-center">
                <FileJson size={32} className="text-gray-400 group-hover:text-white mb-4 transition-colors"/>
                <span className="font-bold">Cargar Archivo JSON</span>
                <span className="text-xs text-gray-500 mt-1">Formato de proyecto completo</span>
                <input type="file" ref={jsonInputRef} accept=".json" className="hidden" onChange={handleImportProject} />
             </div>
          </div>
        </div>
      </div>
    );
  }

  // 4. EDITOR Y VISOR
  const isViewer = currentScreen === 'fabrication_view';
  const isReadOnly = isViewer || (isAdmin && adminPreviewMode);

  return (
    <div className="flex flex-col h-screen bg-gray-50 font-sans overflow-hidden text-gray-800 relative"> 
      
      <input type="file" ref={fileInputRef} onChange={handleImportProject} accept=".json" className="hidden" />
      <input type="file" ref={mapInputRef} onChange={(e) => handleFileUpload(e)} accept="image/*,application/pdf" className="hidden" />
      
      {/* HEADER: En modo visor se superpone (absolute), en modo admin es relativo */}
      <header className={`backdrop-blur-md border-b shadow-sm z-50 transition-all duration-300 
        ${isViewer 
            ? 'absolute top-0 left-0 w-full bg-[#0f172a]/95 text-white border-none' 
            : 'relative bg-white/95 border-gray-200'
        }`}>
        
        <div className="px-6 py-2 flex justify-between items-center h-16">
            {/* IZQUIERDA: Identidad */}
            <div className="flex items-center gap-3 min-w-fit">
                <div className={`p-2 rounded-lg flex items-center justify-center ${isViewer ? 'bg-white/10 text-white' : 'bg-black text-white'}`}>
                    {isViewer ? <Users size={20}/> : <ShieldCheck size={20} />}
                </div>
                <div className="leading-tight">
                    <h1 className="text-sm font-bold tracking-wider uppercase">{isViewer ? 'Modo Visualización' : 'Editor Admin'}</h1>
                    <p className={`text-[10px] font-medium tracking-widest ${isViewer ? 'text-gray-400' : 'text-gray-500'}`}>
                        {isViewer ? 'FABRICACIÓN' : 'ADMINISTRACIÓN'}
                    </p>
                </div>
            </div>

            {/* CENTRO: Filtros */}
            {mapImage && (
                <div className={`flex items-center gap-1 p-1 rounded-lg border shadow-sm mx-4 overflow-x-auto ${isViewer ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                    <div className={`px-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider ${isViewer ? 'text-gray-400' : 'text-gray-400'}`}>
                        <Filter size={12}/> Criticidad
                    </div>
                    {['ALL', 'A', 'B', 'C'].map(f => (
                        <button 
                            key={f} 
                            onClick={() => setFilterPriority(f)}
                            className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all whitespace-nowrap ${
                                filterPriority === f 
                                ? (f === 'A' ? 'bg-red-500 text-white' : f === 'B' ? 'bg-yellow-500 text-white' : f === 'C' ? 'bg-green-500 text-white' : (isViewer ? 'bg-gray-600 text-white' : 'bg-gray-800 text-white'))
                                : (isViewer ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-500 hover:bg-gray-100')
                            }`}
                        >
                            {f === 'ALL' ? 'Todos' : `Nivel ${f}`}
                        </button>
                    ))}
                </div>
            )}

            {/* DERECHA: Acciones */}
            <div className="flex items-center gap-3 min-w-fit">
                {isAdmin && mapImage && (
                    <button 
                        onClick={() => setAdminPreviewMode(!adminPreviewMode)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold border transition-all ${adminPreviewMode ? 'bg-green-100 text-green-700 border-green-300' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                        title={adminPreviewMode ? "Volver a editar" : "Ver como operario"}
                    >
                        {adminPreviewMode ? <Eye size={14}/> : <EyeOff size={14}/>}
                        <span className="hidden sm:inline">{adminPreviewMode ? "Vista Operario" : "Vista Editor"}</span>
                    </button>
                )}
                
                <div className={`h-6 w-px ${isViewer ? 'bg-gray-700' : 'bg-gray-300'}`}></div>

                {isAdmin && (
                    <button onClick={handleCloseProject} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors" title="Cerrar Proyecto (Borrar Mapa)">
                        <Trash2 size={18} />
                    </button>
                )}

                <button onClick={handleExitToLanding} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${isViewer ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                    <LogOut size={14} /> Salir
                </button>
            </div>
        </div>

        {/* TOOLBAR SECUNDARIA (SOLO ADMIN y NO PREVIEW) */}
        {isAdmin && !adminPreviewMode && mapImage && (
            <div className="px-6 py-2 bg-gray-50/80 border-t border-gray-200 flex justify-between items-center gap-4 overflow-x-auto">
                {/* Herramientas */}
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mr-2">Herramientas</span>
                    <div className="flex bg-white rounded-lg border border-gray-200 p-0.5 shadow-sm">
                        {[
                            {id: 'marker', icon: MapIcon, label: 'Marcador'},
                            {id: 'text', icon: Type, label: 'Texto'},
                            {id: 'safety', icon: TriangleAlert, label: 'Seguridad'}
                        ].map(t => (
                            <button key={t.id} onClick={() => setTool(t.id)} className={`px-3 py-1.5 rounded-md flex items-center gap-2 text-xs font-semibold transition-all ${tool === t.id ? 'bg-black text-white shadow-sm' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}>
                                <t.icon size={14}/> {t.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Importar Datos (NUEVO) */}
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mr-2">Datos</span>
                    <button onClick={() => setShowBulkImportModal(true)} className="px-3 py-1.5 rounded-md text-xs font-medium bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 flex items-center gap-2" title="Importar lista de puntos"><FileText size={14} /> Importar Datos</button>
                </div>

                {/* Archivo (REORGANIZADO) */}
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mr-2">Archivo</span>
                    <div className="flex gap-1">
                        <button onClick={() => mapInputRef.current?.click()} className="px-3 py-1.5 rounded-md text-xs font-medium bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 flex items-center gap-2" title="Cargar Nueva Imagen de Fondo"><FileImage size={14} /> Cargar Imagen</button>
                        <button onClick={() => fileInputRef.current?.click()} className="px-3 py-1.5 rounded-md text-xs font-medium bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 flex items-center gap-2" title="Cargar JSON"><FolderOpen size={14} /> Cargar JSON</button>
                        <button onClick={handleExportProject} className="px-3 py-1.5 rounded-md text-xs font-medium bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 flex items-center gap-2" title="Descargar Proyecto JSON"><DownloadIcon size={14} /> Descargar JSON</button>
                        <div className="w-px h-6 bg-gray-300 mx-1"></div>
                        <button onClick={handleDownloadMap} className="px-3 py-1.5 rounded-md text-xs font-medium bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 flex items-center gap-2" title="Descargar JPG"><ImageIcon size={14}/> Guardar JPG</button>
                    </div>
                </div>
            </div>
        )}
      </header>

      {/* MODAL DE IMPORTACIÓN MASIVA */}
      {showBulkImportModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in">
              <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg">
                  <div className="flex justify-between items-center mb-4 border-b pb-2">
                      <h3 className="font-bold text-lg text-gray-800">Importar Lista de Puntos</h3>
                      <button onClick={() => setShowBulkImportModal(false)} className="text-gray-400 hover:text-black"><X size={20}/></button>
                  </div>
                  <div className="space-y-4">
                      <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg border border-gray-200">
                          <p className="font-bold mb-1">Instrucciones:</p>
                          <p>Pega tu lista de datos en el siguiente formato (una línea por punto):</p>
                          <code className="block mt-2 bg-white p-1 rounded border border-gray-200 font-mono text-gray-600">Número, Prioridad (A/B/C), Descripción</code>
                      </div>
                      <textarea 
                          className="w-full h-48 border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-black focus:border-black outline-none font-mono"
                          placeholder={`Ejemplo:\nLDA 77, B, Rejilla de sumidero\nLDA 78, A, Muro de contención`}
                          value={bulkImportText}
                          onChange={(e) => setBulkImportText(e.target.value)}
                      />
                      <div className="flex justify-end gap-2">
                          <button onClick={() => setShowBulkImportModal(false)} className="px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-lg">Cancelar</button>
                          <button onClick={handleBulkProcess} className="px-4 py-2 text-sm font-bold text-white bg-black hover:bg-gray-800 rounded-lg">Procesar Lista</button>
                      </div>
                  </div>
              </div>
          </div>
      )}

      <div className="flex flex-1 overflow-hidden relative h-full">
        {isAdmin && !adminPreviewMode && (
          <aside className="w-72 bg-white border-r border-gray-100 flex flex-col z-30 shadow-[4px_0_24px_rgba(0,0,0,0.02)] relative h-full">
            <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
              {!mapImage && (
                 <div className="flex flex-col gap-3">
                    {/* Opción Subir Plano */}
                    <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:bg-gray-50 transition-colors cursor-pointer relative group">
                        <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*,application/pdf" onChange={(e) => handleFileUpload(e)} />
                        <div className="bg-gray-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-400 group-hover:scale-110 transition-transform">{isProcessingPDF ? <Loader2 className="animate-spin" size={20}/> : <Upload size={20} />}</div>
                        <h3 className="text-sm font-bold text-gray-700">{isProcessingPDF ? 'Procesando PDF...' : 'Subir Plano'}</h3>
                        <p className="text-xs text-gray-400 mt-1">Formatos: JPG, PNG, PDF</p>
                    </div>
                    
                    {/* Nueva opción Cargar JSON debajo */}
                    <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:bg-gray-50 transition-colors cursor-pointer group flex flex-col items-center justify-center gap-2">
                        <div className="bg-gray-100 w-10 h-10 rounded-full flex items-center justify-center text-gray-400 group-hover:text-black transition-colors">
                            <FileJson size={18} />
                        </div>
                        <h3 className="text-xs font-bold text-gray-600">Cargar Proyecto JSON</h3>
                    </div>
                 </div>
              )}
              {selectedPointId && (
                <div className="animate-in slide-in-from-left duration-300 space-y-6">
                  <div className="flex justify-between items-center border-b pb-4">
                    <div className="flex items-center gap-2 text-gray-800">
                        {points.find(p => p.id === selectedPointId)?.type === 'text' ? <Type size={18}/> : points.find(p => p.id === selectedPointId)?.type === 'safety' ? <TriangleAlert size={18} /> : <MapIcon size={18}/>}
                        <span className="font-bold text-sm uppercase">Propiedades</span>
                    </div>
                    <button onClick={() => deletePoint(selectedPointId)} className="text-gray-400 hover:text-red-500"><Trash2 size={16} /></button>
                  </div>
                  
                  {/* SELECTOR DE CRITICIDAD */}
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 space-y-2">
                      <label className="text-[10px] font-bold text-gray-500 uppercase flex items-center gap-1"><Filter size={10}/> Criticidad / Nivel</label>
                      <div className="flex gap-2">
                          {['A', 'B', 'C'].map(p => (
                              <button 
                                key={p}
                                onClick={() => updatePoint(selectedPointId, 'priority', p)}
                                className={`flex-1 py-1.5 text-xs font-bold rounded border transition-all ${
                                    points.find(item => item.id === selectedPointId)?.priority === p
                                    ? (p==='A' ? 'bg-red-100 text-red-700 border-red-300 ring-1 ring-red-500' : p==='B' ? 'bg-yellow-100 text-yellow-700 border-yellow-300 ring-1 ring-yellow-500' : 'bg-green-100 text-green-700 border-green-300 ring-1 ring-green-500')
                                    : 'bg-white text-gray-500 hover:bg-gray-50'
                                }`}
                              >
                                {p}
                              </button>
                          ))}
                      </div>
                  </div>

                  {/* SELECTOR DE ESTADO (NUEVO) */}
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 space-y-2">
                      <label className="text-[10px] font-bold text-gray-500 uppercase flex items-center gap-1"><CheckCircle2 size={10}/> Estado del Trabajo</label>
                      <div className="grid grid-cols-1 gap-1.5">
                          <button 
                            onClick={() => updatePoint(selectedPointId, 'status', 'executed')}
                            className={`flex items-center justify-center gap-2 py-1.5 text-xs font-bold rounded border transition-all ${
                                points.find(item => item.id === selectedPointId)?.status === 'executed'
                                ? 'bg-green-600 text-white border-green-600 shadow-sm'
                                : 'bg-white text-gray-500 hover:bg-green-50 hover:text-green-600 border-gray-200'
                            }`}
                          >
                            <CheckCircle2 size={12}/> EJECUTADO
                          </button>
                          <button 
                            onClick={() => updatePoint(selectedPointId, 'status', 'process')}
                            className={`flex items-center justify-center gap-2 py-1.5 text-xs font-bold rounded border transition-all ${
                                points.find(item => item.id === selectedPointId)?.status === 'process'
                                ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
                                : 'bg-white text-gray-500 hover:bg-orange-50 hover:text-orange-600 border-gray-200'
                            }`}
                          >
                            <Clock size={12}/> EN PROCESO
                          </button>
                          <button 
                            onClick={() => updatePoint(selectedPointId, 'status', 'delayed')}
                            className={`flex items-center justify-center gap-2 py-1.5 text-xs font-bold rounded border transition-all ${
                                points.find(item => item.id === selectedPointId)?.status === 'delayed'
                                ? 'bg-red-600 text-white border-red-600 shadow-sm'
                                : 'bg-white text-gray-500 hover:bg-red-50 hover:text-red-600 border-gray-200'
                            }`}
                          >
                            <AlertOctagon size={12}/> ATRASADO
                          </button>
                          <button 
                            onClick={() => updatePoint(selectedPointId, 'status', 'pending')}
                            className={`flex items-center justify-center gap-2 py-1.5 text-xs font-bold rounded border transition-all ${
                                points.find(item => item.id === selectedPointId)?.status === 'pending'
                                ? 'bg-gray-500 text-white border-gray-500 shadow-sm'
                                : 'bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-600 border-gray-200'
                            }`}
                          >
                            <Circle size={12}/> PENDIENTE
                          </button>
                      </div>
                  </div>

                  {points.find(p => p.id === selectedPointId)?.type === 'text' && (
                    <>
                      <div className="space-y-1"><label className="text-[10px] font-bold text-gray-400 uppercase">Contenido</label><input type="text" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm" value={points.find(p => p.id === selectedPointId)?.label || ''} onChange={(e) => updatePoint(selectedPointId, 'label', e.target.value)} /></div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase">Colores</label>
                        <div className="space-y-3">
                           {Object.entries(PRIMARY_PALETTES).map(([cat, colors]) => (<div key={cat}><p className="text-[10px] text-gray-400 mb-1">{cat}</p><div className="flex flex-wrap gap-1.5">{colors.map(c => (<button key={c} onClick={() => updatePoint(selectedPointId, 'color', c)} className={`w-6 h-6 rounded-full border ${points.find(p => p.id === selectedPointId)?.color === c ? 'ring-2 ring-blue-500' : ''}`} style={{ backgroundColor: c }} />))}</div></div>))}
                        </div>
                      </div>
                      <div className="space-y-1 pt-2"><label className="text-[10px] font-bold text-gray-400 uppercase">Tamaño</label><input type="range" min="10" max="64" className="w-full" value={points.find(p => p.id === selectedPointId)?.fontSize} onChange={(e) => updatePoint(selectedPointId, 'fontSize', parseInt(e.target.value))} /></div>
                      <div className="grid grid-cols-2 gap-4"><div className="space-y-1"><label className="text-[10px] font-bold text-gray-400 uppercase">Estilo</label><div className="flex gap-1"><button onClick={() => updatePoint(selectedPointId, 'isBold', !points.find(p => p.id === selectedPointId)?.isBold)} className={`flex-1 p-1.5 rounded border ${points.find(p => p.id === selectedPointId)?.isBold ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white'}`}><Bold size={16} className="mx-auto"/></button><button onClick={() => updatePoint(selectedPointId, 'isItalic', !points.find(p => p.id === selectedPointId)?.isItalic)} className={`flex-1 p-1.5 rounded border ${points.find(p => p.id === selectedPointId)?.isItalic ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white'}`}><Italic size={16} className="mx-auto"/></button></div></div><div className="space-y-1"><label className="text-[10px] font-bold text-gray-400 uppercase">Fuente</label><select className="w-full bg-white border rounded text-xs py-1.5 px-2 outline-none" value={points.find(p => p.id === selectedPointId)?.fontFamily} onChange={(e) => updatePoint(selectedPointId, 'fontFamily', e.target.value)}><option value="sans">Moderna</option><option value="serif">Clásica</option><option value="mono">Técnica</option></select></div></div>
                    </>
                  )}

                  {points.find(p => p.id === selectedPointId)?.type === 'safety' && (
                    <>
                      <div className="space-y-3">
                          <label className="text-[10px] font-bold text-gray-400 uppercase">Tipo de Señal</label>
                          <div className="grid grid-cols-3 gap-2">
                            {Object.entries(SAFETY_ICONS).map(([key, config]) => {
                                const Icon = config.icon;
                                const isActive = points.find(p => p.id === selectedPointId)?.safetyType === key;
                                return (
                                    <button key={key} onClick={() => {
                                        updatePoint(selectedPointId, 'safetyType', key);
                                        updatePoint(selectedPointId, 'markerColor', config.bg);
                                        updatePoint(selectedPointId, 'textColor', config.defaultColor);
                                        updatePoint(selectedPointId, 'title', config.label);
                                        if (points.find(p => p.id === selectedPointId)?.customSafetyIcon) updatePoint(selectedPointId, 'customSafetyIcon', null);
                                    }} className={`flex flex-col items-center gap-1 p-2 rounded border transition-all ${isActive ? 'bg-blue-50 border-blue-300 ring-1 ring-blue-500' : 'bg-white hover:bg-gray-50'}`}>
                                        <Icon size={18} color={config.defaultColor} />
                                        <span className="text-[9px] font-medium text-gray-600">{config.label}</span>
                                    </button>
                                )
                            })}
                            <label className={`flex flex-col items-center gap-1 p-2 rounded border transition-all cursor-pointer ${points.find(p => p.id === selectedPointId)?.safetyType === 'custom' ? 'bg-blue-50 border-blue-300 ring-1 ring-blue-500' : 'bg-white hover:bg-gray-50'}`}>
                                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, (res) => {
                                    setPoints(points.map(p => p.id === selectedPointId ? { ...p, customSafetyIcon: res, safetyType: 'custom' } : p));
                                })} />
                                <Upload size={18} className="text-gray-500" />
                                <span className="text-[9px] font-medium text-gray-600">Subir Icono</span>
                            </label>
                         </div>
                      </div>
                      <div className="space-y-1 pt-4"><label className="text-[10px] font-bold text-gray-400 uppercase">Tamaño</label><input type="range" min="0.5" max="3" step="0.1" className="w-full" value={points.find(p => p.id === selectedPointId)?.scaleX || 1.5} onChange={(e) => { const v = parseFloat(e.target.value); updatePoint(selectedPointId, 'scaleX', v); updatePoint(selectedPointId, 'scaleY', v); }} /></div>
                      <div className="space-y-4 pt-4 border-t"><div className="flex items-center gap-2"><span className="text-[10px] font-bold bg-blue-50 text-blue-500 px-2 rounded">INFO POPUP</span></div><div className="space-y-1"><label className="text-xs text-gray-500">Título</label><input type="text" className="w-full border rounded px-2 py-1.5 text-sm" value={points.find(p => p.id === selectedPointId)?.title || ''} onChange={(e) => updatePoint(selectedPointId, 'title', e.target.value)} /></div><div className="space-y-2"><label className="text-xs text-gray-500">Imagen</label>{!points.find(p => p.id === selectedPointId)?.image ? (<label className="flex flex-col items-center justify-center w-full h-20 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50"><ImageIcon size={16}/><input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, (res) => updatePoint(selectedPointId, 'image', res))} /></label>) : (<div className="relative group"><img src={points.find(p => p.id === selectedPointId).image} className="w-full h-32 object-cover rounded-lg" /><div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex justify-center items-center gap-2 transition-opacity"><label className="cursor-pointer bg-white p-1.5 rounded-full"><Edit size={14}/><input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, (res) => updatePoint(selectedPointId, 'image', res))} /></label></div></div>)}</div><div className="space-y-1"><textarea className="w-full border rounded px-2 py-2 text-sm" rows="3" value={points.find(p => p.id === selectedPointId)?.description || ''} onChange={(e) => updatePoint(selectedPointId, 'description', e.target.value)} /></div></div>
                    </>
                  )}
                  
                  {points.find(p => p.id === selectedPointId)?.type === 'marker' && (
                    <>
                      <div className="space-y-2"><label className="text-[10px] font-bold text-gray-400 uppercase">Estilo</label><div className="grid grid-cols-3 gap-2">{['green', 'yellow', 'dotted-black'].map(s => (<button key={s} onClick={() => updatePoint(selectedPointId, 'style', s)} className={`p-2 rounded-lg border ${points.find(p => p.id === selectedPointId)?.style === s ? 'ring-2 ring-blue-500' : ''}`}><div className={`w-full h-5 ${s === 'green' ? 'bg-green-600' : s === 'yellow' ? 'bg-yellow-400' : 'border-2 border-dotted border-black rounded-full'}`}></div></button>))}</div></div>
                      {(points.find(p => p.id === selectedPointId)?.style === 'green' || points.find(p => p.id === selectedPointId)?.style === 'yellow') && (
                        <div className="space-y-2 bg-gray-50 p-2 rounded border"><label className="text-[10px] font-bold text-gray-400">Tono Rectángulo</label><div className="flex flex-wrap gap-1.5">{(points.find(p => p.id === selectedPointId)?.style === 'green' ? RECT_PALETTES['Verde Monocromo'] : RECT_PALETTES['Amarillo Monocromo']).map(c => (<button key={c} onClick={() => updatePoint(selectedPointId, 'markerColor', c)} className={`w-6 h-6 rounded-md border ${points.find(p => p.id === selectedPointId)?.markerColor === c ? 'ring-2 ring-blue-500' : ''}`} style={{ backgroundColor: c }} />))}</div></div>
                      )}
                      {points.find(p => p.id === selectedPointId)?.style === 'dotted-black' && (
                        <div className="space-y-3 bg-gray-50 p-3 rounded-lg border"><div className="flex justify-between"><label className="text-[10px] font-bold text-gray-400">Acabado Mate</label><select className="text-[10px]" value={matteShade} onChange={(e) => setMatteShade(e.target.value)}><option value="light">Claro</option><option value="dark">Oscuro</option></select></div><div className="flex flex-wrap gap-2">{MATTE_OPTIONS[matteShade].map(c => (<button key={c} onClick={() => updatePoint(selectedPointId, 'markerColor', c)} className={`w-8 h-8 rounded-full border ${points.find(p => p.id === selectedPointId)?.markerColor === c ? 'ring-2 ring-blue-500' : ''}`} style={{ backgroundColor: c }} />))}</div></div>
                      )}
                      
                      <div className="space-y-2 pt-1"><label className="text-[10px] font-bold text-gray-400 uppercase">Color del Texto</label><div className="flex bg-gray-100 p-1 rounded-lg">{['#000000', '#ffffff'].map(c => (<button key={c} onClick={() => updatePoint(selectedPointId, 'textColor', c)} className={`flex-1 py-1.5 text-xs rounded-md flex items-center justify-center gap-2 transition-all ${points.find(p => p.id === selectedPointId)?.textColor === c ? 'bg-white shadow-sm font-bold text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}><div className={`w-3 h-3 border ${c==='#000000'?'bg-black border-transparent':'bg-white border-gray-300'}`}></div>{c === '#000000' ? 'Negro' : 'Blanco'}</button>))}</div></div>
                      <div className="grid grid-cols-2 gap-4 pt-2">
                        <div className="space-y-1"><div className="flex justify-between"><label className="text-[10px] font-bold text-gray-400 uppercase">Ancho (X)</label> <span className="text-xs text-gray-500">{points.find(p => p.id === selectedPointId)?.scaleX?.toFixed(1)}x</span></div><input type="range" min="0.5" max="4" step="0.1" className="w-full" value={points.find(p => p.id === selectedPointId)?.scaleX || 1} onChange={(e) => updatePoint(selectedPointId, 'scaleX', parseFloat(e.target.value))} /></div>
                        <div className="space-y-1"><div className="flex justify-between"><label className="text-[10px] font-bold text-gray-400 uppercase">Alto (Y)</label> <span className="text-xs text-gray-500">{points.find(p => p.id === selectedPointId)?.scaleY?.toFixed(1)}x</span></div><input type="range" min="0.5" max="4" step="0.1" className="w-full" value={points.find(p => p.id === selectedPointId)?.scaleY || 1} onChange={(e) => updatePoint(selectedPointId, 'scaleY', parseFloat(e.target.value))} /></div>
                      </div>
                      <div className="space-y-1 pt-2">
                        <div className="flex justify-between"><label className="text-[10px] font-bold text-gray-400 uppercase">Tamaño Letra</label> <span className="text-xs text-gray-500">{points.find(p => p.id === selectedPointId)?.markerFontSize || 10}px</span></div>
                        <input type="range" min="6" max="32" className="w-full" value={points.find(p => p.id === selectedPointId)?.markerFontSize || 10} onChange={(e) => updatePoint(selectedPointId, 'markerFontSize', parseInt(e.target.value))} />
                        <button onClick={() => { updatePoint(selectedPointId, 'scaleX', 2.6); updatePoint(selectedPointId, 'scaleY', 1.1); updatePoint(selectedPointId, 'markerFontSize', 20); }} className="mt-2 w-full bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold py-1.5 rounded border border-gray-300 flex items-center justify-center gap-1"><LayoutTemplate size={12} /> Estándar (2.6x)</button>
                        <button onClick={() => { updatePoint(selectedPointId, 'scaleX', 3); updatePoint(selectedPointId, 'scaleY', 1.1); updatePoint(selectedPointId, 'markerFontSize', 20); }} className="mt-2 w-full bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold py-1.5 rounded border border-gray-300 flex items-center justify-center gap-1"><LayoutTemplate size={12} /> Estándar 2 (3x)</button>
                      </div>
                      <div className="space-y-1 pt-2"><label className="text-[10px] font-bold text-gray-400 uppercase">Etiqueta</label><input type="text" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-center" value={points.find(p => p.id === selectedPointId)?.label || ''} onChange={(e) => updatePoint(selectedPointId, 'label', e.target.value)} /></div>
                      <div className="space-y-4 pt-4 border-t"><div className="flex items-center gap-2"><span className="text-[10px] font-bold bg-blue-50 text-blue-500 px-2 rounded">INFO POPUP</span></div><div className="space-y-1"><label className="text-xs text-gray-500">Título</label><input type="text" className="w-full border rounded px-2 py-1.5 text-sm" value={points.find(p => p.id === selectedPointId)?.title || ''} onChange={(e) => updatePoint(selectedPointId, 'title', e.target.value)} /></div><div className="space-y-2"><label className="text-xs text-gray-500">Imagen</label>{!points.find(p => p.id === selectedPointId)?.image ? (<label className="flex flex-col items-center justify-center w-full h-20 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50"><ImageIcon size={16}/><input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, (res) => updatePoint(selectedPointId, 'image', res))} /></label>) : (<div className="relative group"><img src={points.find(p => p.id === selectedPointId).image} className="w-full h-32 object-cover rounded-lg" /><div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex justify-center items-center gap-2 transition-opacity"><label className="cursor-pointer bg-white p-1.5 rounded-full"><Edit size={14}/><input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, (res) => updatePoint(selectedPointId, 'image', res))} /></label></div></div>)}</div><div className="space-y-1"><textarea className="w-full border rounded px-2 py-2 text-sm" rows="3" value={points.find(p => p.id === selectedPointId)?.description || ''} onChange={(e) => updatePoint(selectedPointId, 'description', e.target.value)} /></div></div>
                    </>
                  )}
                  <button onClick={() => setSelectedPointId(null)} className="w-full py-2.5 bg-gray-800 text-white text-xs font-bold rounded-lg">Guardar</button>
                </div>
              )}
            </div>
            <div className="p-5 border-t bg-gray-50/50"><p className="text-center text-[10px] font-serif text-gray-400 tracking-[0.2em]">CREADO POR ELIAS DOLORES MOTA PARA LA FABRICACION</p></div>
          </aside>
        )}
        
        {/* MAP CONTAINER */}
        <main 
            className={`flex-1 relative overflow-hidden select-none ${isViewer ? 'bg-[#020617]' : 'bg-gray-100/50'}`} 
            ref={containerRef} 
            // Apply cursor style directly
            style={{ cursor: isPanning ? cursorGrabbing : (tool === 'text' && isAdmin && !adminPreviewMode ? 'text' : cursorGrab) }}
            onMouseDown={(e) => { 
                if (!mapImage || draggingElementId) return; 
                setIsPanning(true); 
                setStartPan({ x: e.clientX - pan.x, y: e.clientY - pan.y }); 
            }} 
            onClick={() => setSelectedPointId(null)} // Click al fondo cierra el panel
            onWheel={handleWheel}
        >
          {!mapImage ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-300">
                <MapIcon size={48} /><p className="mt-4">Cargue un mapa para comenzar</p>
            </div> 
          ) : (
            <div ref={mapRef} className="absolute origin-top-left transition-transform duration-75 ease-linear" style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`, minWidth: '100%' }} onDoubleClick={handleMapDoubleClick}>
              <img ref={imgRef} src={mapImage} alt="Plano" draggable="false" className="pointer-events-none block max-w-none" />
              {visiblePoints.map(point => (
                  <React.Fragment key={point.id}>
                      {point.type === 'text' 
                        ? <TextElement point={point} isSelected={selectedPointId === point.id} readOnly={isReadOnly} onMouseDown={handleMouseDown} onDoubleClick={handleDoubleClick} /> 
                        : point.type === 'safety' 
                        ? <SafetyElement point={point} isSelected={selectedPointId === point.id} readOnly={isReadOnly} onMouseDown={handleMouseDown} onDoubleClick={handleDoubleClick} />
                        : <MarkerElement point={point} isSelected={selectedPointId === point.id} readOnly={isReadOnly} onMouseDown={handleMouseDown} onDoubleClick={handleDoubleClick} />
                      }
                      {selectedPointId === point.id && (point.type === 'marker' || point.type === 'safety') && (<Popup point={point} onClose={() => setSelectedPointId(null)} />)}
                  </React.Fragment>
              ))}
            </div>
          )}
          {mapImage && isAdmin && !adminPreviewMode && <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur px-4 py-1.5 rounded-full text-white text-xs pointer-events-none opacity-80">Doble clic para crear</div>}
          {mapImage && <div className="absolute bottom-8 right-8 flex flex-col gap-2 bg-white/90 p-1.5 rounded-xl shadow-2xl"><button onClick={()=>handleZoom(0.2)}><ZoomIn size={18}/></button><button onClick={handleResetView}><Maximize size={18}/></button><button onClick={()=>handleZoom(-0.2)}><ZoomOut size={18}/></button></div>}
        </main>
      </div>
    </div>
  );
}