import { Button, Modal } from "react-bootstrap";
import PDFViewer from "./PDFViewer.jsx";

const PDFViewerModal = ({ show, onHide, fileUrl, title = "Resume Preview" }) => {
  return (
    <Modal
      show={show}
      onHide={onHide}
      size="lg"
      centered
      contentClassName="bg-white"
    >
      <Modal.Header closeButton style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e5e7eb' }}>
        <Modal.Title style={{ color: '#1f2937' }}>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-0">
        {fileUrl && <PDFViewer fileUrl={fileUrl} />}
      </Modal.Body>
      <Modal.Footer style={{ backgroundColor: '#ffffff', borderTop: '1px solid #e5e7eb' }}>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default PDFViewerModal;
