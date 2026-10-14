import { mergePagesInOrder, pagesFromFile, type PageItem } from './pdfPages'

/** Merge whole files in order (all pages per file). */
export async function mergePdfs(files: File[]): Promise<Uint8Array> {
  const pages: PageItem[] = []
  for (const file of files) {
    pages.push(...(await pagesFromFile(file)))
  }
  return mergePagesInOrder(pages)
}

export { mergePagesInOrder, pagesFromFile }
