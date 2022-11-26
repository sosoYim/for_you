// @ts-check

/**
 * @typedef {Object} MetricInformation
 * @prop {string} title
 * @prop {number} score
 * @prop {string} displayValue
 */

/**
 * @typedef {Object} Audits
 * @prop {MetricInformation} first-contentful-paint
 * @prop {MetricInformation} speed-index
 * @prop {MetricInformation} total-blocking-time
 * @prop {MetricInformation} largest-contentful-paint
 * @prop {MetricInformation} cumulative-layout-shift
 */

/**
 * @typedef {Object} Summary
 * @prop {number} performance
 * @prop {number} accessibility
 * @prop {number} best-practices
 * @prop {number} seo
 * @prop {number} pwa
 */

/**
 * @typedef {Object} Manifest
 * @prop {string} url
 * @prop {boolean} isRepresentativeRun
 * @prop {string} htmlPath
 * @prop {string} jsonPath
 * @prop {Summary} summary
 */

const fs = require('fs')

const metricList = [
  'first-contentful-paint',
  'interactive',
  'speed-index',
  'total-blocking-time',
  'largest-contentful-paint',
  'cumulative-layout-shift',
]

const roundUpScore = (/** @type { number } */ score) => Math.round(score * 100)

const getEmojiByScore = (/** @type { number } */ score) => {
  if (score >= 90) {
    return '🔵'
  }
  if (score >= 70) {
    return '🟢'
  }
  if (score >= 50) {
    return '🟡'
  }
  return score >= 30 ? '🟠' : '🔴'
}

const createSummaryTable = (/** @type { Summary } */ summary) =>
  Object.entries(summary)
    .map(([key, value]) => {
      const roundedScore = roundUpScore(value)
      return `| ${getEmojiByScore(roundedScore)} ${key} | ${roundedScore} |`
    })
    .join('\n')

const createMetricsTable = (/** @type { string } */ jsonPath) => {
  /**
   * @type {{ audits: Audits }}
   */
  const { audits } = JSON.parse(fs.readFileSync(jsonPath).toString())

  return metricList
    .map((metric) => {
      /**
       * @type { MetricInformation }
       */
      const { title, score, displayValue } = audits[metric]
      const roundedScore = roundUpScore(score)

      return `| ${getEmojiByScore(roundedScore)} ${title} | ${displayValue} |`
    })
    .join('\n')
}

module.exports = (/** @type { string } */ workspace) => {
  /**
   * @type { Manifest[] }
   */
  const manifests = JSON.parse(
    fs.readFileSync(`${workspace}/lhci_reports/manifest.json`).toString()
  )

  const title = '## 🌹🌹 Lighthouse Report 🌹🌹'
  const subTitle = 'JK의 정성이 가득한 Lighthouse CI 웹 성능 지표 보고서 뿅--\n'

  const comments = manifests
    .map(({ summary, jsonPath }, index) => {
      const summaryTable = createSummaryTable(summary)
      const metricsTable = createMetricsTable(jsonPath)

      return [
        `### Running ${index + 1}`,
        '| Summary | Score |',
        '| -- | -- |',
        summaryTable,
        '\n| Metrics | Value |',
        '| -- | -- |',
        metricsTable,
      ].join('\n')
    })
    .join('\n')

  return [title, subTitle, comments].join('\n')
}
