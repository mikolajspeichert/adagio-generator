const fs = require('fs')
const readline = require('readline')
const util = require('./utils')

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

const readFile = () => new Promise(resolve => {
  fs.readFile('file.json', 'utf8', (err, file) => {
    resolve(JSON.parse(file))
  })
})

const question = q =>
  new Promise(resolve => {
    rl.question(`${q}\n`, answer => {
      resolve(answer)
    })
  })

const getAccidental = key => {
  return key === 's' ? 'sharp' : key ==='n' ? 'normal' : key === 'f' ? 'flat' : null
}

const single = async (item) => {
  let note
  let clef = 'any'
  while (1) {
    note = await question('Type next block note for clef ' + clef + ' with + if multiple in block. If want to end, type stop')
    // format: t|b _ 60 _ 8 _ s|n|f _ d|&t
    // treble/bass _ midi _ size _ accidental
    if (!note) continue
    if (note === 'stop') return note
    const array = note.split(' ')
    const data = {}
    clef = array[0]
    data.size = parseInt(array[2], 10)
    if(array[1] === 'p'){
      data.type = 'pause'
      item.push(data)
      return clef
    }
    data.type = 'note'
    data.midi = util.resolveMIDIValue(array[1])
    if(array[3]) {
      data.accidental = getAccidental(array[3])
    }
    if(array.includes('d')) data.dot = 'single'
    if(array.includes('dd')) data.dot = 'double'
    /// there also could be tie, but fuck it for now
    item.push(data)
    if(!array.includes('+')) return clef
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
  fs.writeFile('file.json', JSON.stringify(data, null, 2), 'utf8', () => {
    console.log('Succeeded')
  });
  const backup = new Date().getTime()
  fs.writeFile(`file-${backup}.json`, JSON.stringify(data, null, 2), 'utf8', () => {
    console.log('Backup succeeded')
  });
}

startListening()