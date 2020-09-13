import React from 'react'
import { useStaticQuery, graphql } from 'gatsby'
import classnames from 'classnames'

import { renderedComponent } from '~plugins/gatsby-render-components'

import { FormatNumber } from '~components/utils/format'
import Percent from '~components/pages/race/dashboard/percent'

import Logo from '~images/ctp-icon-small.png'
import CarLogo from '~images/car-logo-small.png'
import alertIcon from '~images/race-dashboard/alert-bang-orange.svg'

import socialCardStyle from './state.module.scss'

const getGroups = state => {
  if (state === undefined) {
    return {}
  }

  let groups = [
    {
      label: 'Black',
      style: socialCardStyle.barBlack,
      cases:
        state.blackPosPercap === '' ? undefined : state.blackPosPercap * 100, // perCap is *per 1,000*, mulitply by 100 to get *per 100,000*
      deaths:
        state.blackDeathPercap === ''
          ? undefined
          : state.blackDeathPercap * 100,
    },
    {
      label: 'Hispanic/Latino',
      style: socialCardStyle.barLatinx,
      cases:
        state.latinXPosPercap === '' ? undefined : state.latinXPosPercap * 100,
      deaths:
        state.latinXDeathPercap === ''
          ? undefined
          : state.latinXDeathPercap * 100,
    },
    {
      label: 'Asian',
      style: socialCardStyle.barAsian,
      cases:
        state.asianPosPercap === '' ? undefined : state.asianPosPercap * 100,
      deaths:
        state.asianDeathPercap === ''
          ? undefined
          : state.asianDeathPercap * 100,
    },
    {
      label: 'AIAN',
      style: socialCardStyle.barAian,
      cases: state.aianPosPercap === '' ? undefined : state.aianPosPercap * 100,
      deaths:
        state.aianDeathPercap === '' ? undefined : state.aianDeathPercap * 100,
    },
    {
      label: 'White',
      style: socialCardStyle.barWhite,
      cases:
        state.whitePosPercap === '' ? undefined : state.whitePosPercap * 100,
      deaths:
        state.whiteDeathPercap === ''
          ? undefined
          : state.whiteDeathPercap * 100,
    },
    {
      label: 'API',
      style: socialCardStyle.barAPi,
      cases: state.apiPosPercap === '' ? undefined : state.apiPosPercap * 100,
      deaths:
        state.apiDeathPercap === '' ? undefined : state.apiDeathPercap * 100,
    },
    {
      label: 'NHPI',
      style: socialCardStyle.barNhpi,
      cases: state.nhpiPosPercap === '' ? undefined : state.nhpiPosPercap * 100,
      deaths:
        state.nhpiDeathPercap === '' ? undefined : state.nhpiDeathPercap * 100,
    },
  ]

  const aPi = groups.find(group => group.label === 'API')

  if (
    (aPi.cases === '' && aPi.deaths === '') ||
    (aPi.cases === undefined && aPi.deaths === undefined)
  ) {
    groups = groups.filter(
      // remove API bar
      group => group.label !== 'API',
    )
  } else {
    groups = groups.filter(
      // remove asian and NHPI bars
      group => group.label !== 'NHPI' && group.label !== 'Asian',
    )
  }

  groups = groups.filter(
    // remove groups without case or death data
    group => group.cases !== '' && group.deaths !== '',
  )

  groups = groups.filter(
    // remove groups without case or death data
    group => group.cases !== undefined && group.deaths !== undefined,
  )

  const maxCasesPerCap = Math.max(...groups.map(group => group.cases))
  const maxDeathsPerCap = Math.max(...groups.map(group => group.deaths))

  groups.sort((a, b) => {
    // sort bars by # of deaths
    if (a.deaths >= b.deaths) {
      return -1
    }
    return 1
  })

  const worstDeathsValue = groups[0].deaths
  const worstDeathsGroup = groups[0].label

  groups.sort((a, b) => {
    // sort bars by # of cases
    if (a.cases >= b.cases) {
      return -1
    }
    return 1
  })

  const worstCasesValue = groups[0].cases
  const worstCasesGroup = groups[0].label

  return {
    groups,
    maxCasesPerCap,
    maxDeathsPerCap,
    worstCasesGroup,
    worstCasesValue,
    worstDeathsGroup,
    worstDeathsValue,
  }
}

const getTypeOfRates = (state, combinedStates) => {
  let noDeaths
  let noCases

  if (combinedStates.indexOf(state.state) >= 0) {
    // if this state combines race and ethnicity data
    noDeaths = parseFloat(state.knownRaceEthDeath) === 0
    noCases = parseFloat(state.knownRaceEthPos) === 0
  } else {
    noDeaths = parseFloat(state.knownRaceDeath) === 0
    noCases = parseFloat(state.knownRacePos) === 0
  }

  const oneChart = (noCases || noDeaths) && !(noCases && noDeaths)

  const casesOnly = oneChart && noDeaths

  const deathsOnly = oneChart && noCases

  if (deathsOnly) {
    return 'death rates'
  }

  if (casesOnly) {
    return 'case rates'
  }

  return 'infection and death rates'
}

const raceDict = {
  API: 'Asian and Pacific Islander',
  Black: 'Black/African American',
  'Hispanic/Latino': 'Hispanic/Latino',
  All: 'All',
  Asian: 'Asian',
  AIAN: 'American Indian or Alaska Native',
  White: 'White',
  NHPI: 'Native Hawaiian and Pacific Islander',
}

const SocialCardLede = ({ typeOfRates, state, stateName }) => {
  const today = new Date()
  const { worstCasesGroup, worstDeathsGroup } = getGroups(state)
  return (
    <>
      In <strong>{state.stateName || stateName}</strong>, as of{' '}
      {today.toLocaleString('default', { month: 'long' })} {today.getDate()},{' '}
      Worst cases: {raceDict[worstCasesGroup]}, Worst deaths:{' '}
      {raceDict[worstDeathsGroup]} Rates: {typeOfRates}
    </>
  )
}

const StateRaceSocialCard = renderedComponent(
  ({ state, population, combinedStates, square = false }) => {
    // gets the width of the bar for the bar charts
    const getWidth = (number, max) =>
      `${number / max > 0.1 ? (number / max) * 100 : 10}%`

    // prepend 'The' to DC's name
    const stateName =
      state.stateName === 'District of Columbia'
        ? 'The District of Columbia'
        : state.stateName

    const groupValues = getGroups(state)
    const { groups } = groupValues

    let noDeaths
    let noCases

    const isCombinedState = combinedStates.indexOf(state.state) >= 0

    if (isCombinedState) {
      // if this state combines race and ethnicity data
      noDeaths = parseFloat(state.knownRaceEthDeath) === 0
      noCases = parseFloat(state.knownRaceEthPos) === 0
    } else {
      noDeaths = parseFloat(state.knownRaceDeath) === 0
      noCases = parseFloat(state.knownRacePos) === 0
    }

    const oneChart = (noCases || noDeaths) && !(noCases && noDeaths)

    const noCharts = noCases && noDeaths

    const casesOnly = oneChart && noDeaths

    const deathsOnly = oneChart && noCases

    if (deathsOnly) {
      groups.sort((a, b) => {
        // sort bars by # of deaths
        if (a.deaths >= b.deaths) {
          return -1
        }
        return 1
      })
    }

    const today = new Date()

    const typeOfRates = getTypeOfRates(state, combinedStates)

    if (noCharts) {
      return (
        <div>
          <div
            className={classnames(
              socialCardStyle.noDataContainer,
              square && socialCardStyle.square,
            )}
          >
            <img
              className={socialCardStyle.alert}
              src={alertIcon}
              alt="Alert icon"
            />
            <p>
              As of {today.toLocaleString('default', { month: 'long' })}{' '}
              {today.getDate()}, <strong>{stateName}</strong> did not report
              race and ethnicity data to allow for this comparison.
            </p>
            <p className={socialCardStyle.getBetterData}>
              Help us get better data:
              <br />
              <strong>www.covidtracking.com/race/get-better-data</strong>
            </p>
            {square && (
              <div className={socialCardStyle.logosContainer}>
                <img src={Logo} alt="" className={socialCardStyle.ctpLogo} />
                <img src={CarLogo} alt="" className={socialCardStyle.carLogo} />
              </div>
            )}
          </div>
          {!square && (
            <>
              <img src={Logo} alt="" className={socialCardStyle.ctpLogo} />
              <img src={CarLogo} alt="" className={socialCardStyle.carLogo} />
            </>
          )}
        </div>
      )
    }

    return (
      <div
        className={classnames(
          socialCardStyle.container,
          square && socialCardStyle.square,
        )}
      >
        <div
          className={classnames(
            socialCardStyle.grid,
            casesOnly && socialCardStyle.casesOnly,
            deathsOnly && socialCardStyle.deathsOnly,
          )}
        >
          {!square && <span />}
          {/*
            adds a spacer element to the grid, since the non-square
            header spans two columns, not all three
          */}
          <p className={socialCardStyle.header}>
            <SocialCardLede
              typeOfRates={typeOfRates}
              state={state}
              population={population}
            />
          </p>
          <span /> {/* spacer for css grid */}
          {!deathsOnly && (
            <span
              className={classnames(
                socialCardStyle.casesHeader,
                socialCardStyle.barHeader,
              )}
            >
              Cases per 100,000 people
            </span>
          )}
          {!casesOnly && (
            <span
              className={classnames(
                socialCardStyle.deathsHeader,
                socialCardStyle.barHeader,
              )}
            >
              Deaths per 100,000 people
            </span>
          )}
          {groups.map(({ label, style, cases, deaths }) => (
            <>
              <span className={socialCardStyle.barLabel}>
                {raceDict[label]}
              </span>
              {!deathsOnly && (
                <div
                  className={classnames(socialCardStyle.bar, style)}
                  style={{
                    width: getWidth(cases, groupValues.worstCasesValue),
                  }}
                >
                  <FormatNumber number={cases} />
                </div>
              )}
              {!casesOnly && (
                <div
                  className={classnames(
                    socialCardStyle.bar,
                    socialCardStyle.deathBar,
                    style,
                  )}
                  style={{
                    width: getWidth(deaths, groupValues.worstDeathsValue),
                  }}
                >
                  <FormatNumber number={deaths} />
                </div>
              )}
            </>
          ))}
          <p className={socialCardStyle.notes}>
            {state.knownRaceEthPos ? (
              <>
                <strong>Notes: </strong> {stateName} has reported race and
                ethnicity data for <Percent number={state.knownRaceEthPos} /> of
                cases and <Percent number={state.knownRaceEthDeath} /> of
                deaths.
              </>
            ) : (
              <>
                <strong>Notes: </strong> {stateName} has reported race data for{' '}
                <Percent number={state.knownRacePos} /> of cases and{' '}
                <Percent number={state.knownRaceDeath} /> of deaths, and
                ethnicity data for <Percent number={state.knownEthPos} /> of
                cases and <Percent number={state.knownEthDeath} /> of deaths.
              </>
            )}{' '}
            Graphic only includes demographic groups reported by the state.
          </p>
        </div>

        <img src={Logo} alt="" className={socialCardStyle.ctpLogo} />
        <img src={CarLogo} alt="" className={socialCardStyle.carLogo} />
      </div>
    )
  },
)

const CreateStateRaceSocialCards = () => {
  const data = useStaticQuery(graphql`
    {
      allCovidRaceDataCombined(filter: { state: { ne: "US" } }) {
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
          apiPosPercap
          apiDeathPercap
        }
      }
      allCovidRaceDataSeparate(filter: { state: { ne: "US" } }) {
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
          apiPosPercap
          apiDeathPercap
        }
      }
      allCovidStateInfo(filter: { state: { ne: "US" } }) {
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

  const combinedStates = data.allCovidRaceDataCombined.nodes.map(
    node => node.state,
  )

  return (
    <>
      {states.map(state => (
        <>
          <StateRaceSocialCard
            state={
              data.allCovidRaceDataSeparate.nodes.find(
                node => node.state === state.state,
              ) ||
              data.allCovidRaceDataCombined.nodes.find(
                node => node.state === state.state,
              )
            }
            population={
              data.allCovidStateInfo.nodes.find(
                node => node.state === state.state,
              ).childPopulation.population
            }
            combinedStates={combinedStates}
            renderOptions={{
              width: 900,
              height: 472.5,
              relativePath: 'race-dashboard',
              filename: `${state.childSlug.slug}`,
            }}
          />
          <StateRaceSocialCard
            state={
              data.allCovidRaceDataSeparate.nodes.find(
                node => node.state === state.state,
              ) ||
              data.allCovidRaceDataCombined.nodes.find(
                node => node.state === state.state,
              )
            }
            population={
              data.allCovidStateInfo.nodes.find(
                node => node.state === state.state,
              ).childPopulation.population
            }
            combinedStates={combinedStates}
            renderOptions={{
              width: 700,
              height: 700,
              relativePath: 'race-dashboard',
              filename: `${state.childSlug.slug}-square`,
            }}
            square
          />
        </>
      ))}
    </>
  )
}

export default CreateStateRaceSocialCards

export { SocialCardLede, getGroups, getTypeOfRates }
