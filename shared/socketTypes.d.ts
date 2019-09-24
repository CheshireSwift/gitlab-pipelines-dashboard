type SocketChannel = 'pipeline'
type PipelineEmission = {
  object_attributes: {
    id: number;
    ref: string;
    tag: boolean;
    sha: string;
    status: string;
    created_at: string;
    finished_at: string;
  }
  project: {
    path_with_namespace: string;
    id?: number;
  }
}