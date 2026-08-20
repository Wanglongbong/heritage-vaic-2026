declare module "pdfmake/build/pdfmake" {
  import type { TDocumentDefinitions } from "pdfmake/interfaces";

  type VirtualFileSystem = Record<string, string>;
  type PdfMake = {
    addVirtualFileSystem: (vfs: VirtualFileSystem) => void;
    createPdf: (definition: TDocumentDefinitions) => { download: (filename?: string) => void };
  };

  const pdfMake: PdfMake;
  export default pdfMake;
}

declare module "pdfmake/build/vfs_fonts" {
  const vfs: Record<string, string>;
  export default vfs;
}
