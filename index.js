const fs = require('fs')
const readline = require('readline')
const util = require('./utils')

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

const readFile = path => new Promise((resolve, reject) => {
  fs.readFile(path, 'utf8', (err, file) => {
    if(err){
      reject(err)
    }
    resolve(JSON.parse(file))
  })
})

const writeFile = (path, data) => new Promise((resolve, reject) => {
  fs.writeFile(path, JSON.stringify(data, null, 2), 'utf8', err => {
    if(err) {
      reject(err)
    }
    resolve()
  });
})

const question = q =>
  new Promise(resolve => {
    rl.question(`${q}\n`, answer => {
      resolve(answer)
    })
  })

const getVal = ({ ofKey: wantedKey, from }) => {
  let result
  data.forEach(field => {
    if(!field) return
    let [key, val] = field.split(':')
    if(key === wantedKey) {
      result = val
    }
  })
  return result
}

const types = {
  clef: 'c',
  size: 's',
  type: 't',
  midi: 'm',
  accidental: 'a',
  dot: 'd'
}

const single = async (item) => {
  let note
  let clef = 'any'
  while (1) {
    note = await question('Type next block note for clef ' + clef + ' with + if multiple in block. If want to end, type stop\n' +
      'Cheat sheet - c:clef(t,b) s:size(number) t:type(n, t, p, m) m:midi(ex. c4s == C4 sharp) a:accidental(s,f,n) d:dot(1,2)')
    // format: t|b _ 60 _ 8 _ s|n|f _ d|&t
    // treble/bass _ midi _ size _ accidental
    if (!note) continue
    if (note === 'stop') return note
    const structuredData = note.split(' ')
    let data = ''
    clef = getVal({ from: structuredData, ofKey: types.clef })
    let midi = util.resolveMIDIValue(getVal({ from: structuredData, ofKey: types.midi }))

    data = structuredData.filter(field => {
      let [key] = field.split(':')
      return key !== types.clef && key !== types.midi
    }).join(';')

    data += `m:${midi};`

    item.push(data)
    if(note.includes('+')) return clef
  }
}

const multiple = async (treble, bass) => {
  while (1) {
    let item = []
    let clef = await single(item)
    if(clef === 't') treble.push(item)
    if(clef === 'b') bass.push(item)
    if(clef === 'stop') return
  }
}

const startListening = async () => {
  let data = {}
  let wantsToContinue = await question('Do you want to continue previous track?')
  if (wantsToContinue !== 'yes') {
    data.name = await question('Track name?')
    data.author = await question('Track author?')
    data.tempo = parseInt(await question('Tempo?'))
    data.key = await question('Key?')
    data.time = await question('Time?')
    data.treble = []
    data.bass = []
  } else {
    data = await readFile()
  }

  await multiple(data.treble, data.bass)
  rl.close();
  await writeFile('file.json', data)
  const backup = new Date().getTime()
  await writeFile(`file-backup=${backup}`, data)
}

startListening()