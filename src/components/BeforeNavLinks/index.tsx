'use client'

import { NavGroup, useConfig, useNav } from '@payloadcms/ui'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { getClientSettings } from '../../lib/clientSettings'

const baseClass = 'nav'

export default function BeforeNavLinks() {
  const { config } = useConfig()
  const adminRoute = config.routes.admin
  const settings = getClientSettings(config)
  const links = [
    { title: settings.views.schedule.label, url: settings.views.schedule.path },
    { title: settings.views.analytics.label, url: settings.views.analytics.path },
  ]
  const pathname = usePathname()
  const { navOpen } = useNav()

  return (
    <NavGroup label={settings.adminGroup}>
      {links.map((link) => {
        const activeCollection = pathname === adminRoute + link.url

        return (
          <Link
            className={[`${baseClass}__link`, activeCollection && `active`]
              .filter(Boolean)
              .join(' ')}
            href={adminRoute + link.url}
            key={link.url}
            tabIndex={!navOpen ? -1 : undefined}
          >
            {activeCollection && <div className={`${baseClass}__link-indicator`} />}
            <span className={`${baseClass}__link-label`}>{link.title}</span>
          </Link>
        )
      })}
    </NavGroup>
  )
}
