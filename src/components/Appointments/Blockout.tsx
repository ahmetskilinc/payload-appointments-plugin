import React from 'react'
import { BigCalendarAppointment } from '../../types'
import './eventStyles.scss'
import { useDocumentDrawer } from '@payloadcms/ui'

const Blockout = ({
  collectionSlug,
  event,
}: {
  collectionSlug: string
  event: BigCalendarAppointment
}) => {
  const [DocumentDrawer, DocumentDrawerToggler] = useDocumentDrawer({
    id: Number(event.id),
    collectionSlug,
  })
  return (
    <>
      <DocumentDrawerToggler className="event">
        <div className="blockout">
          <p className="event__label">{event.title}</p>
        </div>
      </DocumentDrawerToggler>
      <DocumentDrawer />
    </>
  )
}

export default Blockout
