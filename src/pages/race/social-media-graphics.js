/* eslint-disable no-unused-vars */
import React from 'react'
import { useStaticQuery, graphql } from 'gatsby'

import Layout from '~components/layout'
import RaceSocialCards from '~components/social-media-graphics/race/state'
import SocialCardsSelect from '~components/pages/race/social-media-graphics/select'

export default () => {
  const data = useStaticQuery(graphql`
    {
      contentfulSnippet(slug: { eq: "crdt-social-cards-preamble" }) {
        content {
          childMarkdownRemark {
            html
          }
        }
      }
      allCovidRaceDataCombined(
        filter: { state: { nin: ["AS", "GU", "MP", "VI", "US"] } }
      ) {
        nodes {
          state
          stateName
          knownRaceEthPos
          knownRaceEthDeath
          blackPctPos
          blackPctDeath
          blackPositives
          blackDeaths
          whitePctPos
          whitePctDeath
          whitePositives
          whiteDeaths
          nhpiPctPos
          nhpiPctDeath
          nhpiPositives
          nhpiDeaths
          latinXPctPos
          latinXPctDeath
          latinXPositives
          latinXDeaths
          asianPctPos
          asianPctDeath
          asianPositives
          asianDeaths
          aianPctPos
          aianPctDeath
          aianPositives
          aianDeaths
          blackPosPercap
          blackDeathPercap
          latinXPosPercap
          latinXDeathPercap
          asianPosPercap
          asianDeathPercap
          aianPosPercap
          aianDeathPercap
          whitePosPercap
          whiteDeathPercap
          nhpiPosPercap
          nhpiDeathPercap
        }
      }
      allCovidRaceDataSeparate(
        filter: { state: { nin: ["AS", "GU", "MP", "VI", "US"] } }
      ) {
        nodes {
          state
          stateName
          knownRacePos
          knownRaceDeath
          knownEthPos
          knownEthDeath
          blackPctPos
          blackPctDeath
          blackPositives
          blackDeaths
          whitePctPos
          whitePctDeath
          whitePositives
          whiteDeaths
          nhpiPctPos
          nhpiPctDeath
          nhpiPositives
          nhpiDeaths
          latinXPctPos
          latinXPctDeath
          latinXPositives
          latinXDeaths
          asianPctPos
          asianPctDeath
          asianPositives
          asianDeaths
          aianPctPos
          aianPctDeath
          aianPositives
          aianDeaths
          blackPosPercap
          blackDeathPercap
          latinXPosPercap
          latinXDeathPercap
          asianPosPercap
          asianDeathPercap
          aianPosPercap
          aianDeathPercap
          whitePosPercap
          whiteDeathPercap
          nhpiPosPercap
          nhpiDeathPercap
        }
      }
      allCovidStateInfo(
        filter: { state: { nin: ["AS", "GU", "MP", "VI", "US"] } }
      ) {
        nodes {
          state
          name
          childSlug {
            slug
          }
          childPopulation {
            population
          }
        }
      }
    }
  `)
  const states = data.allCovidStateInfo.nodes

  return (
    <Layout
      title="Social Media Graphics"
      returnLinks={[
        { link: '/race' },
        { link: `/race/dashboard`, title: 'Racial Data Dashboard' },
      ]}
      path="/race/social-media-graphics"
      centered
    >
      <div
        dangerouslySetInnerHTML={{
          __html: data.contentfulSnippet.content.childMarkdownRemark.html,
        }}
      />
      <h3>Share the facts about COVID-19 and Race</h3>
      <p>
        Select a state or territory to see the latest information about COVID-19
        cases and deaths by race and ethnicity. These charts are updated twice a
        week and use standard Census categories for race and ethnicity.
      </p>
      <SocialCardsSelect
        separateStates={data.allCovidRaceDataSeparate.nodes}
        combinedStates={data.allCovidRaceDataCombined.nodes}
        stateInfo={data.allCovidStateInfo.nodes}
      />
      <RaceSocialCards />
    </Layout>
  )
}
