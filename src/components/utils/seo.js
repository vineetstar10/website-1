import React from 'react'
import PropTypes from 'prop-types'
import Helmet from 'react-helmet'
import { useStaticQuery, graphql } from 'gatsby'

function SEO({ lang, meta, title, socialCard }) {
  const { site, contentfulSocialCard } = useStaticQuery(
    graphql`
      query {
        site {
          siteMetadata {
            title
          }
        }
        contentfulSocialCard(slug: { eq: "default" }) {
          description {
            description
          }
          image {
            resize(width: 1200) {
              src
            }
          }
        }
      }
    `,
  )

  const defaultSocialCard = contentfulSocialCard
  let description
  let imageSrc
  if (!socialCard) {
    description = defaultSocialCard.description.description
    imageSrc = defaultSocialCard.image.resize.src
  } else {
    description = socialCard.description.description
    imageSrc = socialCard.image.resize.src
  }

  return (
    <Helmet
      htmlAttributes={{
        lang,
      }}
      title={title}
      defaultTitle={site.siteMetadata.title}
      titleTemplate={`%s | ${site.siteMetadata.title}`}
      meta={[
        {
          property: `og:site_name`,
          content: site.siteMetadata.title,
        },
        {
          property: `og:title`,
          content: title,
        },
        {
          name: `og:image`,
          content: imageSrc,
        },
        {
          name: `twitter:title`,
          content: title,
        },
        {
          name: `twitter:card`,
          content: imageSrc,
        },
        {
          name: `twitter:image`,
          content: imageSrc,
        },
        {
          name: `twitter:site`,
          content: '@COVID19Tracking',
        },

        {
          name: `twitter:creator`,
          content: '@COVID19Tracking',
        },
        {
          name: 'description',
          content: description || site.siteMetadata.description,
        },
      ].concat(meta)}
    />
  )
}

SEO.defaultProps = {
  lang: `en`,
  meta: [],
}

SEO.propTypes = {
  lang: PropTypes.string,
  meta: PropTypes.arrayOf(PropTypes.object),
  title: PropTypes.string.isRequired,
}

export default SEO
