'use client'

import { NavGroup, useConfig, useNav } from '@payloadcms/ui'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { links } from '../../lib/links'

const baseClass = 'nav'

export default function BeforeNavLinks() {
  const {
    config: {
      routes: { admin: adminRoute },
    },
  } = useConfig()
  const pathname = usePathname()
  const { navOpen } = useNav()

  return (
    <NavGroup label="Appointments">
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
