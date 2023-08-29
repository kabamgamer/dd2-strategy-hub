import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useBuildInfoStore = defineStore('buildInfoStore', () => {
    const isLoading = ref<boolean>(true)
    const currentVersion = ref<string>('')
    const versionInfo = ref<{ version: string, releaseDate: string, changeList: string }[]>([])

    fetch('https://raw.githubusercontent.com/kabamgamer/dd2-strategy-hub/master/CHANGELOG.md').then(resp => resp.text())
        .then(changelog => {
            const titleStripped = changelog.substring(changelog.indexOf("\n") + 1).trim()
            const releases = titleStripped.split('## [').filter(release => release !== '')
            releases.forEach(release => {
                let version: string = ''
                let releaseDate: string = ''
                let changeList: string = ''
                let inUnorderedList: boolean
                release.replace(/.*/g, (matches: string): string => {
                    if (matches === '') {
                        return matches
                    }

                    if (!version) {
                        version = matches.substring(0, release.indexOf(']'))
                        // get release data from string ........ (yyyy-mm-dd)
                        releaseDate = matches.substring(matches.length-11, matches.length-1)
                        return matches
                    }

                    if (matches.toLowerCase().indexOf('[full changelog]') !== -1) {
                        return matches
                    }

                    if (!inUnorderedList && matches.indexOf('*') === 0) {
                        changeList += "<ul>"
                        inUnorderedList = true
                    }

                    if (inUnorderedList && matches.indexOf('*') !== 0) {
                        changeList += "</ul>"
                        inUnorderedList = false
                    }

                    changeList += markdownLineToHtml(matches) + (inUnorderedList ? '' : '<br />')

                    return matches
                })

                versionInfo.value.push({version, releaseDate, changeList})
            })

            currentVersion.value = versionInfo.value[0].version

            isLoading.value = false
        })

    function markdownLineToHtml(markdownLine: string): string {
        if (markdownLine.indexOf('*') === 0) {
            return `<li>${markdownLine.substring(2)}</li>`
        }

        if (markdownLine.indexOf('###') === 0) {
            return `<h3>${markdownLine.substring(4)}</h3>`
        }

        if (markdownLine.indexOf('##') === 0) {
            return `<h2>${markdownLine.substring(3)}</h2>`
        }

        if (markdownLine.indexOf('#') === 0) {
            return `<h1>${markdownLine.substring(2)}</h1>`
        }

        return markdownLine
    }

    return { isLoading, currentVersion, versionInfo }
})
