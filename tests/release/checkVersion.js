import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const packageJson = JSON.parse(readFileSync(resolve('package.json'), 'utf8'))
const version = readFileSync(resolve('VERSION'), 'utf8').trim()
const releaseTag = process.argv[2]

if (packageJson.version !== version) {
  console.error(
    `Версии не совпадают: package.json=${packageJson.version}, VERSION=${version}`,
  )
  process.exit(1)
}

if (!/^\d+\.\d+\.\d+$/.test(version)) {
  console.error(`Некорректная версия: ${version}`)
  process.exit(1)
}

if (releaseTag && releaseTag !== `v${version}`) {
  console.error(`Тег ${releaseTag} не соответствует версии v${version}`)
  process.exit(1)
}

console.log(`Версия ${version} согласована.`)
