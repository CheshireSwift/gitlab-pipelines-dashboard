import React from 'react'
import { useLocalStorageOrPrompt, storageKeys } from './localStorage'

export interface GitLabProject {
  id: number
  description: string
  name: string
  name_with_namespace: string
  path: string
  path_with_namespace: string
  default_branch: string
  web_url: string
  avatar_url: string
  last_activity_at: string
  namespace: GitLabNamespace
  _links: {
    //   "self": "https://gitlab.softwire.com/api/v4/projects/748",
    //   "issues": "https://gitlab.softwire.com/api/v4/projects/748/issues",
    //   "merge_requests": "https://gitlab.softwire.com/api/v4/projects/748/merge_requests",
    //   "repo_branches": "https://gitlab.softwire.com/api/v4/projects/748/repository/branches",
    //   "labels": "https://gitlab.softwire.com/api/v4/projects/748/labels",
    // events: string,
    //   "members": "https://gitlab.softwire.com/api/v4/projects/748/members"
  },
  empty_repo: boolean
  archived: boolean
  jobs_enabled: boolean
  public_jobs: boolean
}

interface GitLabNamespace {
  id: number
  name: string
  path: string
  kind: string
  full_path: string
  parent_id: number
  avatar_url: string
  web_url: string
}

export type PipelineStatus = 'running' | 'pending' | 'success' | 'failed' | 'canceled' | 'skipped'

export interface GitLabPipeline {
  id: number
  sha: string
  ref: string
  status: PipelineStatus
  web_url: string
}

export interface GitLabPipelineDetails {
  id: number,
  status: PipelineStatus
  ref: string
  sha: string
  before_sha: string
  tag: boolean,
  user: {
    name: string
    username: string
    id: number,
    avatar_url: string
    web_url: string
  },
  created_at: string | null
  updated_at: string | null
  started_at: string | null
  finished_at: string | null
  committed_at: string | null
  duration: number | null,
  coverage: string
  web_url: string
}

const pathJoin = (...segments: string[]) => segments.join('/').replace(/\/+/, '/')

const apiFetchWithConfig = (apiUrl: string, apiToken: string) => (
  path: string,
  init?: RequestInit,
) =>
  fetch(pathJoin(apiUrl, path), {
    method: 'GET',
    ...init,
    headers: {
      Authorization: `Bearer ${apiToken}`,
      ...(init && init.headers),
    },
  })

type FetchFunc = (path: string, init?: RequestInit) => Promise<Response>
type FetchAdditions = {
  url: string
  token: string
  setCredentials: (credentials: { url: string; token: string }) => void
  clearCredentials: () => void
}
export type ApiFetch = FetchFunc & FetchAdditions

export function useGitLabApiFetch(): ApiFetch {
  const [url, setUrl, clearUrl] = useLocalStorageOrPrompt(
    storageKeys.apiUrl,
    'Enter GitLab API URL',
  )
  const [token, setToken, clearToken] = useLocalStorageOrPrompt(
    storageKeys.apiToken,
    'Enter GitLab access token',
  )

  const apiFetch = apiFetchWithConfig(url, token)
  return Object.assign<FetchFunc, FetchAdditions>(apiFetch, {
    url,
    token,
    setCredentials: ({ url, token }) => {
      setUrl(url)
      setToken(token)
    },
    clearCredentials: () => {
      clearUrl()
      clearToken()
    },
  })
}

export function useGitLabApiData<T>(path: string, refreshMinutes?: number): T | undefined {
  const apiFetch = React.useContext(ApiContext);
  const [data, setData] = React.useState<T>()

  const refreshData = () => {
    apiFetch(path)
      .then(r => r.json())
      .then(setData)
  }

  React.useEffect(() => {
    refreshData()

    if (refreshMinutes) {
      const intervalId = setInterval(refreshData, 1000 * 60 * refreshMinutes)
      return () => {
        clearInterval(intervalId)
      }
    }
  }, [apiFetch.url, apiFetch.token, path, refreshMinutes])

  return data
}

export const useGitLabApiDataLink = <Origin extends { _links: any }>(origin: Origin | undefined) => <Linked>(link: keyof Origin['_links']): Linked | undefined => {
  if (!origin) {
    return undefined
  }

  const fullPath = origin['_links'][link] as unknown as string | undefined
  if (!fullPath) {
    return undefined
  }

  const apiFetch = React.useContext(ApiContext)
  const routePath = fullPath.replace(apiFetch.url, '');
  return useGitLabApiData<Linked>(routePath)
}

export const ApiContext = React.createContext<ApiFetch>(
  Object.assign(
    () => new Promise<Response>(() => { }),
    { url: '', token: '', setCredentials: () => { }, clearCredentials: () => { } },
  )
)