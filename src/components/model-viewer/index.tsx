import '@google/model-viewer'

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': ModelViewerJSX & React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>
    }
  }
}

interface ModelViewerJSX {
  id: string
  src: string
  autoplay: boolean
  alt: any
  className: string
  style: React.CSSProperties
}

const ModelViewer = (props: ModelViewerJSX) => (
  <model-viewer {...props} />
)

export default ModelViewer