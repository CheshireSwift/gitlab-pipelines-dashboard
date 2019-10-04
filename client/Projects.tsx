import moment from 'moment'
import React from 'react'
import {
  GitLabPipeline,
  GitLabPipelineDetails,
  GitLabProject,
  useGitLabApiData,
} from './api'
import LoadingSpinner from './LoadingSpinner'

function colorForStatus(status: GitLabPipeline['status']) {
  switch (status) {
    case 'canceled':
    case 'skipped':
      return 'blue'
    case 'success':
      return 'green'
    case 'failed':
      return 'red'
    case 'running':
      return 'yellow'
    case 'pending':
      return 'orange'
    case 'skipped':
      return 'white'
  }
}

const TimeDisplay = ({
  pipelineDetails,
}: {
  pipelineDetails: GitLabPipelineDetails
}) => {
  const startMoment =
    pipelineDetails.started_at && moment(pipelineDetails.started_at)
  const endMoment =
    pipelineDetails.finished_at && moment(pipelineDetails.finished_at)
  return (
    <>
      {endMoment ? (
        <>
          {startMoment && (
            <div>
              Ran in {moment.duration(endMoment.diff(startMoment)).humanize()}
            </div>
          )}
          <div>Finished {endMoment.fromNow()}</div>
        </>
      ) : (
        pipelineDetails.started_at && (
          <div>{moment(pipelineDetails.started_at).fromNow()}</div>
        )
      )}
    </>
  )
}

const PipelineTile = ({
  projectId,
  pipeline,
}: {
  projectId: number
  pipeline: GitLabPipeline
}) => {
  const details = useGitLabApiData<GitLabPipelineDetails>(
    `projects/${projectId}/pipelines/${pipeline.id}`,
  )

  return (
    <a key={pipeline.id} href={pipeline.web_url} target="__blank">
      <div
        style={{
          margin: '1rem',
          padding: '1.5rem',
          width: '12rem',
          border: `0.25rem solid var(--${colorForStatus(pipeline.status)})`,
          boxShadow: `0 0 2rem var(--${colorForStatus(pipeline.status)})`,
          borderRadius: '1rem',
        }}
      >
        <div>
          <span style={{ fontWeight: 'bold' }}>{pipeline.ref}</span> (
          {pipeline.sha.substring(0, 6)}){' '}
        </div>
        <div>
          {details ? (
            <>
              <div style={{ margin: '0.5rem 0' }}>
                <img
                  style={{
                    width: '2rem',
                    height: '2rem',
                    marginRight: '0.5rem',
                    borderRadius: '20rem',
                    verticalAlign: 'middle',
                  }}
                  src={details.user.avatar_url}
                />
                {details.user.name}
              </div>
              <TimeDisplay pipelineDetails={details} />
            </>
          ) : (
            <LoadingSpinner />
          )}
        </div>
        <div style={{ fontWeight: 'bold' }}>{pipeline.status}</div>
      </div>
    </a>
  )
}

const ProjectPipelines = ({ projectId }: { projectId: number }) => {
  const pipelines = useGitLabApiData<GitLabPipeline[]>(
    `projects/${projectId}/pipelines`,
    1,
  )

  if (!pipelines) {
    return <LoadingSpinner />
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        padding: '1rem',
      }}
    >
      {pipelines.map((pipeline) => (
        <PipelineTile
          key={pipeline.id}
          projectId={projectId}
          pipeline={pipeline}
        />
      ))}
    </div>
  )
}

export const Projects = ({ filter }: { filter: string }) => {
  const projectsData = useGitLabApiData<GitLabProject[]>('projects')
  if (!projectsData) {
    return (
      <div>
        <LoadingSpinner />
      </div>
    )
  }

  const filterElements = filter.toLowerCase().split(',')
  const projectMatchesFilter = (project: GitLabProject) =>
    [project.namespace.name, project.path, project.path_with_namespace]
      .map((field) => field.toLowerCase())
      .some((field) => filterElements.includes(field))

  const projects = projectsData.filter(
    (project) =>
      !project.archived &&
      project.jobs_enabled &&
      projectMatchesFilter(project),
  )

  const groupedProjects = projects.reduce<{
    [namespace: string]: GitLabProject[]
  }>(
    (grouped, project) => ({
      ...grouped,
      [project.namespace.name]: [
        ...(grouped[project.namespace.name] || []),
        project,
      ],
    }),
    {},
  )

  return (
    <>
      <style>
        {`
      .hide-scrollbar {
        scrollbar-width: none;
      }
      .hide-scrollbar::-webkit-scrollbar {
        display: none;
      }
      `}
      </style>
      {Object.keys(groupedProjects).map((namespace) => (
        <>
          <h1 key={namespace + 'h'}>{namespace}</h1>
          <div
            key={namespace}
            style={{ display: 'flex', flexDirection: 'row', height: '100%' }}
          >
            {groupedProjects[namespace]
              .sort((a, b) =>
                a.path_with_namespace.localeCompare(b.path_with_namespace),
              )
              .map((project) => (
                <div key={project.id} style={{ height: '100%' }}>
                  <h2>{project.path_with_namespace}</h2>
                  <div
                    className="hide-scrollbar"
                    style={{ overflowY: 'scroll', height: 'calc(100% - 2rem)' }}
                  >
                    <ProjectPipelines projectId={project.id} />
                  </div>
                </div>
              ))}
          </div>
        </>
      ))}
    </>
  )
}

export default Projects
