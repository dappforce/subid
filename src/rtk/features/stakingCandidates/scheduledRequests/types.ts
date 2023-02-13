import { ScheduledRequestsEntity } from './scheduledRequestsSlice'

export type ScheduledRequestsEntityRecord = Record<string, ScheduledRequestsEntity>

export type ScheduledRequestsByDelegatorRecord = Record<string, ScheduledRequests>

export type ScheduledRequestsByDelegatorEntityRecord = Record<string, ScheduledRequestsByDelegatorEntity>

export type ScheduledRequestsByDelegatorEntity = {
  id: string
  loading: boolean
  requests: ScheduledRequestsByDelegatorRecord
}

export type ScheduledRequestByCandidate = {
  id: string
  requests: ScheduledRequests[]
}

export type ScheduledRequests = {
  delegator: string
  whenExecutable: number
  action: any
}
