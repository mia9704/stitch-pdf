import { useCallback, useRef, useState } from 'react'
import { mergePagesInOrder, pagesFromFile, type PageItem } from './lib/pdfPages'
import './App.css'

type ViewMode = 'files' | 'pages'

type FileEntry = {
  id: string
  file: File
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function downloadBlob(data: Uint8Array, filename: string) {
  const blob = new Blob([data], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function reorderList<T>(list: T[], from: number, to: number): T[] {
  if (to < 0 || to >= list.length || from === to) return list
  const next = [...list]
  const [removed] = next.splice(from, 1)
  next.splice(to, 0, removed)
  return next
}

function rebuildPagesFromFileOrder(orderedFiles: FileEntry[], pages: PageItem[]): PageItem[] {
  const byFile = new Map<File, PageItem[]>()
  for (const page of pages) {
    const list = byFile.get(page.file) ?? []
    list.push(page)
    byFile.set(page.file, list)
  }
  const result: PageItem[] = []
  for (const entry of orderedFiles) {
    const filePages = byFile.get(entry.file)
    if (filePages) {
      filePages.sort((a, b) => a.pageIndex - b.pageIndex)
      result.push(...filePages)
    }
  }
  return result
}

export default function App() {
  const [files, setFiles] = useState<FileEntry[]>([])
  const [pages, setPages] = useState<PageItem[]>([])
  const [viewMode, setViewMode] = useState<ViewMode>('files')
  const [dragOver, setDragOver] = useState(false)
  const [importing, setImporting] = useState(false)
  const [merging, setMerging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const addFiles = useCallback(async (fileList: FileList | File[]) => {
    const pdfs = Array.from(fileList).filter(
      (f) => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf'),
    )
    if (pdfs.length === 0) {
      setError('Please choose PDF files only.')
      return
    }
    setError(null)
    setImporting(true)
    try {
      const newEntries: FileEntry[] = pdfs.map((file) => ({
        id: crypto.randomUUID(),
        file,
      }))
      const newPages: PageItem[] = []
      for (const entry of newEntries) {
        newPages.push(...(await pagesFromFile(entry.file)))
      }
      setFiles((prev) => [...prev, ...newEntries])
      setPages((prev) => [...prev, ...newPages])
    } catch {
      setError('Could not read one of the PDFs. It may be corrupted or password-protected.')
    } finally {
      setImporting(false)
    }
  }, [])

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragOver(false)
      if (e.dataTransfer.files.length) {
        void addFiles(e.dataTransfer.files)
      }
    },
    [addFiles],
  )

  const moveFile = (from: number, to: number) => {
    setFiles((prev) => {
      const next = reorderList(prev, from, to)
      setPages((currentPages) => rebuildPagesFromFileOrder(next, currentPages))
      return next
    })
  }

  const removeFile = (id: string) => {
    setFiles((prev) => {
      const entry = prev.find((f) => f.id === id)
      if (!entry) return prev
      setPages((p) => p.filter((page) => page.file !== entry.file))
      return prev.filter((f) => f.id !== id)
    })
    setError(null)
  }

  const movePage = (from: number, to: number) => {
    setPages((prev) => reorderList(prev, from, to))
  }

  const removePage = (id: string) => {
    setPages((prev) => {
      const next = prev.filter((p) => p.id !== id)
      const remainingFiles = new Set(next.map((p) => p.file))
      setFiles((fileList) => fileList.filter((f) => remainingFiles.has(f.file)))
      return next
    })
    setError(null)
  }

  const clearAll = () => {
    setFiles([])
    setPages([])
    setError(null)
  }

  const handleMerge = async () => {
    if (pages.length === 0) {
      setError('Add at least one page to export.')
      return
    }
    setMerging(true)
    setError(null)
    try {
      const bytes = await mergePagesInOrder(pages)
      const base =
        files.length === 1
          ? files[0].file.name.replace(/\.pdf$/i, '')
          : 'merged'
      downloadBlob(bytes, `${base}-stitched.pdf`)
    } catch {
      setError('Could not merge these PDFs. One file may be corrupted or password-protected.')
    } finally {
      setMerging(false)
    }
  }

  const listMeta =
    pages.length > 0
      ? `${pages.length} page${pages.length === 1 ? '' : 's'} from ${files.length} file${files.length === 1 ? '' : 's'}`
      : null

  return (
    <div className="app">
      <header className="header">
        <div className="logo" aria-hidden>
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <rect x="4" y="6" width="14" height="20" rx="2" fill="var(--accent)" opacity="0.9" />
            <rect x="14" y="4" width="14" height="20" rx="2" fill="var(--accent-2)" />
          </svg>
        </div>
        <div>
          <h1>Edit PDF</h1>
          <p className="tagline">Merge and reorder PDFs locally — nothing leaves your browser.</p>
        </div>
      </header>

      <main className="main">
        <section
          className={`dropzone ${dragOver ? 'dropzone--active' : ''} ${importing ? 'dropzone--busy' : ''}`}
          onDragOver={(e) => {
            e.preventDefault()
            setDragOver(true)
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          onClick={() => !importing && inputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              if (!importing) inputRef.current?.click()
            }
          }}
        >
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf,.pdf"
            multiple
            hidden
            disabled={importing}
            onChange={(e) => {
              if (e.target.files?.length) void addFiles(e.target.files)
              e.target.value = ''
            }}
          />
          <span className="dropzone-icon" aria-hidden>
            ↓
          </span>
          <p className="dropzone-title">
            {importing ? 'Reading PDF pages…' : 'Drop PDFs here or click to browse'}
          </p>
          <p className="dropzone-hint">You can add more files anytime</p>
        </section>

        {pages.length > 0 && (
          <section className="list-section" aria-label="Merge order">
            <div className="list-header">
              <div className="list-header-row">
                <h2>Order</h2>
                <div className="view-toggle" role="tablist" aria-label="Order by">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={viewMode === 'files'}
                    className={`view-toggle-btn ${viewMode === 'files' ? 'view-toggle-btn--active' : ''}`}
                    onClick={() => setViewMode('files')}
                  >
                    Files
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={viewMode === 'pages'}
                    className={`view-toggle-btn ${viewMode === 'pages' ? 'view-toggle-btn--active' : ''}`}
                    onClick={() => setViewMode('pages')}
                  >
                    Pages
                  </button>
                </div>
              </div>
              {listMeta && <span className="list-meta">{listMeta}</span>}
            </div>

            {viewMode === 'files' ? (
              <ul className="file-list">
                {files.map((item, index) => (
                  <li
                    key={item.id}
                    className={`file-item ${dragIndex === index ? 'file-item--dragging' : ''}`}
                    draggable
                    onDragStart={() => setDragIndex(index)}
                    onDragEnd={() => setDragIndex(null)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      if (dragIndex !== null) moveFile(dragIndex, index)
                      setDragIndex(null)
                    }}
                  >
                    <span className="file-grip" aria-hidden title="Drag to reorder">
                      ⋮⋮
                    </span>
                    <span className="file-index">{index + 1}</span>
                    <span className="file-name" title={item.file.name}>
                      {item.file.name}
                    </span>
                    <span className="file-size">{formatBytes(item.file.size)}</span>
                    <div className="file-actions">
                      <button
                        type="button"
                        className="icon-btn"
                        aria-label="Move up"
                        disabled={index === 0}
                        onClick={() => moveFile(index, index - 1)}
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        className="icon-btn"
                        aria-label="Move down"
                        disabled={index === files.length - 1}
                        onClick={() => moveFile(index, index + 1)}
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        className="icon-btn icon-btn--danger"
                        aria-label="Remove file"
                        onClick={() => removeFile(item.id)}
                      >
                        ×
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <ul className="file-list page-list">
                {pages.map((item, index) => (
                  <li
                    key={item.id}
                    className={`file-item page-item ${dragIndex === index ? 'file-item--dragging' : ''}`}
                    draggable
                    onDragStart={() => setDragIndex(index)}
                    onDragEnd={() => setDragIndex(null)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      if (dragIndex !== null) movePage(dragIndex, index)
                      setDragIndex(null)
                    }}
                  >
                    <span className="file-grip" aria-hidden title="Drag to reorder">
                      ⋮⋮
                    </span>
                    <span className="file-index">{index + 1}</span>
                    <span className="page-label">
                      <span className="file-name" title={item.file.name}>
                        {item.file.name}
                      </span>
                      <span className="page-detail">
                        Page {item.pageIndex + 1} of {item.pageCount}
                      </span>
                    </span>
                    <div className="file-actions">
                      <button
                        type="button"
                        className="icon-btn"
                        aria-label="Move up"
                        disabled={index === 0}
                        onClick={() => movePage(index, index - 1)}
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        className="icon-btn"
                        aria-label="Move down"
                        disabled={index === pages.length - 1}
                        onClick={() => movePage(index, index + 1)}
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        className="icon-btn icon-btn--danger"
                        aria-label="Remove page"
                        onClick={() => removePage(item.id)}
                      >
                        ×
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {viewMode === 'files' && (
              <p className="list-hint">
                Reorder whole documents here, or switch to <strong>Pages</strong> to rearrange individual
                pages (including across files).
              </p>
            )}
          </section>
        )}

        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}

        <div className="actions">
          <button type="button" className="btn btn--secondary" disabled={pages.length === 0} onClick={clearAll}>
            Clear all
          </button>
          <button
            type="button"
            className="btn btn--primary"
            disabled={pages.length === 0 || merging || importing}
            onClick={handleMerge}
          >
            {merging ? 'Merging…' : 'Download merged PDF'}
          </button>
        </div>
      </main>

      <footer className="footer">
        <p>Processing runs entirely on your device.</p>
      </footer>
    </div>
  )
}
