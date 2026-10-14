import { PDFDocument } from 'pdf-lib'

export type PageItem = {
  id: string
  file: File
  pageIndex: number
  pageCount: number
}

export async function pagesFromFile(file: File): Promise<PageItem[]> {
  const bytes = new Uint8Array(await file.arrayBuffer())
  const doc = await PDFDocument.load(bytes, { ignoreEncryption: true })
  const pageCount = doc.getPageCount()
  return Array.from({ length: pageCount }, (_, pageIndex) => ({
    id: crypto.randomUUID(),
    file,
    pageIndex,
    pageCount,
  }))
}

export async function mergePagesInOrder(pages: PageItem[]): Promise<Uint8Array> {
  const merged = await PDFDocument.create()
  const docByFile = new Map<File, PDFDocument>()

  for (const { file, pageIndex } of pages) {
    let source = docByFile.get(file)
    if (!source) {
      const bytes = new Uint8Array(await file.arrayBuffer())
      source = await PDFDocument.load(bytes, { ignoreEncryption: true })
      docByFile.set(file, source)
    }
    const [copied] = await merged.copyPages(source, [pageIndex])
    merged.addPage(copied)
  }

  return merged.save()
}
