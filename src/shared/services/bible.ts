import { abbrevs } from './abbrevs';
import { plano } from './plano';
import biblia from './biblias/NAA.json';

export const months = [
  'Janeiro', 
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro'
]

export interface VerseOfDay {
  title: string;
  content: {
    chapter: string,
    verse: string,
    text: string
  }[]
}

export function getVerseOfDay(month: string, day: string, part: string): VerseOfDay | undefined {
  const monthName = months[parseInt(month) - 1];
  const result = plano.find((item: { [x: string]: string; }) => item['Mês'] === monthName && item['dia do mês'] === "dia " + day);

  if (!result) return;

  switch (part) {
    case 'at':
      return {
        title: getTitle(result['Antigo Testamento']),
        content: getVerses(getChapters(result['Antigo Testamento']))
      }
    case 'nt':
      return {
        title: getTitle(result['Novo Testamento']),
        content: getVerses(getChapters(result['Novo Testamento']))
      }
    case 'sl':
      return {
        title: getTitle(result['Salmos']),
        content: getVerses(getChapters(result['Salmos']))
      }
    case 'pv':
      return {
        title: getTitle(result['Provérbios']),
        content: getVerses(getChapters(result['Provérbios']))
      }
    default:
      break;
  }
}

function getTitle(element: string) {
  if (element.indexOf(' - ') !== -1) {
    // "Gn 50.1 - Ex 2.10"
    const books = element.split(' - ');
    const firstBook = books[0].substring(0, element.indexOf(' '));
    const secondBook = books[1].substring(0, element.indexOf(' '));
    return element.replace(firstBook, abbrevs.find(item => item.abbrev === firstBook)?.title || '')
        .replace(secondBook, abbrevs.find(item => item.abbrev === secondBook)?.title || '')
  } else {
    // "2Cr 11.1-13.22"
    const book = element.substring(0, element.indexOf(' '));
    return element.replace(book, abbrevs.find(item => item.abbrev === book)?.title || '');
  }
}

function getVerses(capitulos: { abbrev: string; vers: string[]; chapter: string; }[]) {
  const verses: { chapter: string; verse: string; text: string; }[] = [];
  capitulos.forEach(capitulo => {
    const book = biblia.find(item => item.abbrev === capitulo.abbrev);
    const first = parseInt(capitulo.vers[0]);
    const last = capitulo.vers[1] === 'X' ? book?.chapters[parseInt(capitulo.chapter) - 1].length || 0 : capitulo.vers[1] ? parseInt(capitulo.vers[1]) : first;
    
    for (let i = first; i <= last; i++) {
      verses.push({
        chapter: capitulo.chapter,
        verse: i+"",
        text: book?.chapters[parseInt(capitulo.chapter) - 1][i - 1]+""
      });
    }
  });
  return verses;
}

function getChapters(element: string) {
  const points = element.split('.').length - 1;

  if (points === 2) {
    if(element.includes(' - ')) {
      // "Gn 50.1 - Ex 2.10"
      const chapters = element.split(' - ');
      const items = [getChapterObject(chapters[0] + "-X")];
      if (chapters[1].split('.')[0].includes('2')) {
        items.push(getChapterObject(chapters[1].split('.')[0].replace("2", "1") + '.1-X'));
      }
      items.push(getChapterObject(chapters[1].split('.')[0] + '.1-' + chapters[1].split('.')[1]))
      return items;
    } else {
      // "2Cr 11.1-13.22"
      const chapters = element.split('-');
      const items = [getChapterObject(chapters[0] + "-X")];
      const book = element.substring(0, element.indexOf(' '));

      const firstChapter = parseInt(element.substring(element.indexOf(' ') + 1, element.indexOf('.')));
      const lastChapter = parseInt(chapters[1].split('.')[0]);

      for (let index = firstChapter + 1; index < lastChapter; index++) {
        items.push(getChapterObject(book + " "+ index + ".1-X"));
      }

      items.push(getChapterObject(element.substring(0, element.indexOf(' ')) + ' ' + chapters[1].split('.')[0] + '.1-' + chapters[1].split('.')[1]));
      
      return items;
    }
  } else {
    // "Pv 5.1-6"
    return [getChapterObject(element)];
  }
}

function getChapterObject(element: string) {
  // "Pv 5.1-6"
  const parts = element.split(' ')[1].split('.')[1].split('-');

  return {
    abbrev: element.split(' ')[0],
    chapter: element.split(' ')[1].split('.')[0],
    vers: parts
  }
}