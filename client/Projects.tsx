import React from 'react'
import moment from 'moment'
import {
  GitLabProject,
  useGitLabApiData,
  GitLabPipeline,
  GitLabPipelineDetails,
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
          width: '10rem',
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
    <div style={{ display: 'flex', flexWrap: 'wrap' }}>
      {pipelines.map(pipeline => (
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

  const projects = projectsData.filter(
    project =>
      !project.archived &&
      project.jobs_enabled &&
      project.path_with_namespace.toLowerCase().includes(filter.toLowerCase()),
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
      {Object.keys(groupedProjects).map(namespace => (
        <div key={namespace}>
          <h1>{namespace}</h1>
          {groupedProjects[namespace].map(project => (
            <div key={project.id}>
              <h2>{project.path_with_namespace}</h2>
              <ProjectPipelines projectId={project.id} />
            </div>
          ))}
        </div>
      ))}
    </>
  )
}

export default Projects