interface PipelineEvent {
  object_kind: string;
  object_attributes: PipelineAttributes;
  user: User;
  project: Project;
  commit: Commit;
  builds: Build[];
}

interface PipelineAttributes {
  id: number;
  ref: string;
  tag: boolean;
  sha: string;
  before_sha: string;
  status: string;
  stages: string[];
  created_at: string;
  finished_at: string;
  duration: number;
}

interface User {
  name: string;
  username: string;
  avatar_url: string;
}

interface Project {
  name: string;
  description: string;
  web_url: string;
  avatar_url: string;
  git_ssh_url: string;
  git_http_url: string;
  namespace: string;
  visibility_level: number;
  path_with_namespace: string;
  default_branch: string;
  homepage: string;
  url: string;
  ssh_url: string;
  http_url: string;
  id?: number;
}

interface Commit {
  id: string;
  message: string;
  timestamp: string;
  url: string;
  author: Author;
}

interface Build {
  id: number;
  stage: string;
  name: string;
  status: string;
  created_at: string;
  started_at?: string;
  finished_at?: string;
  when: string;
  manual: boolean;
  user: User;
  runner: any;
  artifacts_file: ArtifactsFile;
}

interface ArtifactsFile {
  filename: string;
  size: number;
}

interface Author {
  name: string;
  email: string;
}