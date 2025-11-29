'use client';

import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function PDFViewer({ file, pageNumber, onLoadSuccess, height, className }) {
    return (
        <Document
            file={file}
            onLoadSuccess={onLoadSuccess}
            className={className}
        >
            <Page
                pageNumber={pageNumber}
                renderTextLayer={false}
                renderAnnotationLayer={false}
                className="w-auto h-auto"
                height={height}
            />
        </Document>
    );
}
