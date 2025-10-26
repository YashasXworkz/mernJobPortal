import { Worker, Viewer } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";

/**
 * Shared PDF Viewer component with consistent configuration
 * Used across: Profile, JobDetails, MyApplications, Applications
 */
const PDFViewer = ({ fileUrl }) => {
  // Using default layout plugin for toolbar controls (zoom, download, print)
  // Sidebar tabs are hidden by default in the configuration
  const defaultLayoutPluginInstance = defaultLayoutPlugin({
    sidebarTabs: () => [], // Empty array to hide sidebar
  });

  return (
    <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
      <div style={{ 
        height: "750px", 
        backgroundColor: "#ffffff" 
      }}>
        <Viewer fileUrl={fileUrl} plugins={[defaultLayoutPluginInstance]} />
      </div>
    </Worker>
  );
};

export default PDFViewer;
