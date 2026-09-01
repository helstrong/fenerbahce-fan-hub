// UI copy in English and Turkish. Hand-rolled rather than pulling in an i18n
// library: the app has one namespace and no pluralisation rules beyond simple
// counts, so a typed record and a substitution helper cover it without adding a
// dependency to the bundle.
//
// Competition and club names are deliberately absent — those arrive from the
// data source as proper nouns and aren't translated.

const en = {
  'nav.home': 'Home',
  'nav.fixtures': 'Fixtures',
  'nav.table': 'Table',
  'nav.squad': 'Squad',
  'nav.club': 'Club',
  'nav.news': 'News',

  'chrome.live': 'Live',
  'chrome.sample': 'Sample',
  'chrome.refresh': 'Refresh data',
  'chrome.language': 'Change language',
  'chrome.season': 'Season',
  'chrome.competition': 'Competition',

  'footer.fanProject':
    'An unofficial fan project, made by supporters. Not affiliated with, endorsed by, or an official channel of Fenerbahçe Spor Kulübü.',

  'common.loading': 'Loading…',
  'common.viewAll': 'View all →',
  'common.back': 'Back',
  'common.played': 'played',
  'common.scored': 'scored',
  'common.conceded': 'conceded',

  'result.W': 'Win',
  'result.D': 'Draw',
  'result.L': 'Loss',
  'resultShort.W': 'W',
  'resultShort.D': 'D',
  'resultShort.L': 'L',

  'home.nextMatch': 'Next match',
  'home.kickingOff': 'Kicking off',
  'home.noUpcoming':
    'No upcoming fixtures right now — the schedule for the next round hasn’t been published yet.',
  'home.sideHome': 'Home',
  'home.sideAway': 'Away',
  'home.days': 'Days',
  'home.hrs': 'Hrs',
  'home.min': 'Min',
  'home.sec': 'Sec',
  'home.lastResult': 'Last result',
  'home.seasonStanding': 'Season standing',
  'home.position': 'Position',
  'home.points': 'Points',
  'home.goalDiff': 'Goal diff',
  'home.last5': 'Last 5',
  'home.fullTable': 'Full table →',
  'home.latestNews': 'Latest news',
  'home.allNews': 'All news →',
  'home.table': 'Table',
  'home.tableError': 'Couldn’t load the table',
  'home.noCompetitions': 'No competitions this season',
  'home.tableUnavailable': 'Table unavailable',
  'home.knockoutStage': 'Knockout stage',

  'fixtures.title': 'Fixtures',
  'fixtures.upcoming': 'Upcoming',
  'fixtures.results': 'Results',
  'fixtures.error': 'Couldn’t load fixtures for this season.',
  'fixtures.loading': 'Loading fixtures…',
  'fixtures.noneUpcoming': 'No upcoming matches this season.',
  'fixtures.noneResults': 'No results this season.',
  'fixtures.note':
    'Includes Süper Lig, Turkish Cup, European ties and friendlies. Friendlies for past seasons may be incomplete.',

  'standings.title': 'Tables',
  'standings.error': 'Couldn’t load tables for this season.',
  'standings.loading': 'Loading tables…',
  'standings.noCompetitions': 'No competitions found for this season.',
  'standings.noData': 'No data available for this competition.',
  'standings.knockoutStage': 'Knockout stage',
  'standings.top4': 'Top 4 qualify for continental football.',
  'standings.freeTier': 'The free data tier returns only the top of the table.',
  'standings.expandHint': 'Tap a club for its season record.',

  'table.rank': '#',
  'table.club': 'Club',
  'table.played': 'P',
  'table.won': 'W',
  'table.drawn': 'D',
  'table.lost': 'L',
  'table.goalsFor': 'GF',
  'table.goalsAgainst': 'GA',
  'table.goalDiff': 'GD',
  'table.points': 'Pts',
  'table.form': 'Form',

  'team.seasonRecord': 'Season record',
  'team.homeRecord': 'Home',
  'team.awayRecord': 'Away',
  'team.results': 'Results',
  'team.noResults': 'No matches played yet this season.',
  'team.vsFener': 'Record vs Fenerbahçe →',

  'h2h.title': 'vs Fenerbahçe',
  'h2h.loading': 'Loading meetings…',
  'h2h.error': 'Couldn’t load the head-to-head record.',
  'h2h.none': 'No recorded meetings with Fenerbahçe in this competition.',
  'h2h.fenerWins': 'Fenerbahçe wins',
  'h2h.draws': 'Draws',
  'h2h.opponentWins': 'Opponent wins',
  'h2h.meetings': 'Meetings',
  'h2h.goals': 'Goals',
  'h2h.coverage':
    'Covering {from} to {to} — the seasons this data source provides. Earlier meetings aren’t available.',

  'squad.title': 'Squad',
  'squad.players': '{n} players',
  'squad.all': 'All',
  'squad.none': 'No players to show.',
  'squad.freeTier':
    'Squad data is provided by TheSportsDB’s free tier, which returns a limited roster and no per-season match statistics.',

  'pos.Goalkeeper': 'Goalkeeper',
  'pos.Defender': 'Defender',
  'pos.Midfielder': 'Midfielder',
  'pos.Forward': 'Forward',
  'posShort.Goalkeeper': 'GK',
  'posShort.Defender': 'DEF',
  'posShort.Midfielder': 'MID',
  'posShort.Forward': 'FWD',

  'player.years': '{n} years',
  'player.foot': 'Foot',
  'player.weight': 'Weight',
  'player.born': 'Born',
  'player.signing': 'Signing',
  'player.career': 'Career',
  'player.honours': 'Honours',
  'player.formerClubs': 'Former clubs',
  'player.loadingCareer': 'Loading career…',
  'player.noCareer': 'No career history available for this player.',
  'player.noStatsNote':
    'This data source carries player profiles only — it publishes no per-match statistics for this league.',

  'club.title': 'Club',
  'club.unavailable': 'Club information is unavailable right now.',
  'club.facts': 'Club facts',
  'club.founded': 'Founded',
  'club.capacity': 'Capacity',
  'club.stadium': 'Stadium',
  'club.nicknames': 'Nicknames',
  'club.competesIn': 'Competes in',
  'club.officialLinks': 'Official links',
  'club.fanArt': 'Fan art',
  'club.kits': 'Kits',

  'news.title': 'News',
  'news.newest': 'Newest',
  'news.oldest': 'Oldest',
  'news.none': 'No news available right now.',
  'news.note': 'Curated from a small set of trusted outlets via Google News.',

  'status.loading': 'Loading the latest…',
  'status.errorTitle': 'Couldn’t load data',
  'status.tryAgain': 'Try again',
  'status.warnings': 'Some sections couldn’t be loaded from the live source:',
  'status.crashed': 'Something went wrong.',
  'status.crashedHelp':
    'Please try reloading the page. If the problem persists, clearing this site’s data may help.',
  'status.reload': 'Reload',
} as const

export type TranslationKey = keyof typeof en

// Typed as a complete record of en's keys, so a missing Turkish string is a
// compile error rather than an English word appearing mid-sentence at runtime.
const tr: Record<TranslationKey, string> = {
  'nav.home': 'Ana Sayfa',
  'nav.fixtures': 'Fikstür',
  'nav.table': 'Puan Durumu',
  'nav.squad': 'Kadro',
  'nav.club': 'Kulüp',
  'nav.news': 'Haberler',

  'chrome.live': 'Canlı',
  'chrome.sample': 'Örnek',
  'chrome.refresh': 'Verileri yenile',
  'chrome.language': 'Dili değiştir',
  'chrome.season': 'Sezon',
  'chrome.competition': 'Turnuva',

  'footer.fanProject':
    'Taraftarlar tarafından yapılmış resmi olmayan bir taraftar projesidir. Fenerbahçe Spor Kulübü ile bağlantılı değildir ve kulübün resmi bir kanalı değildir.',

  'common.loading': 'Yükleniyor…',
  'common.viewAll': 'Tümünü gör →',
  'common.back': 'Geri',
  'common.played': 'maç',
  'common.scored': 'attı',
  'common.conceded': 'yedi',

  'result.W': 'Galibiyet',
  'result.D': 'Beraberlik',
  'result.L': 'Mağlubiyet',
  'resultShort.W': 'G',
  'resultShort.D': 'B',
  'resultShort.L': 'M',

  'home.nextMatch': 'Sıradaki maç',
  'home.kickingOff': 'Başlıyor',
  'home.noUpcoming': 'Şu anda yaklaşan maç yok — sonraki haftanın programı henüz açıklanmadı.',
  'home.sideHome': 'Ev sahibi',
  'home.sideAway': 'Deplasman',
  'home.days': 'Gün',
  'home.hrs': 'Saat',
  'home.min': 'Dk',
  'home.sec': 'Sn',
  'home.lastResult': 'Son sonuç',
  'home.seasonStanding': 'Sezon durumu',
  'home.position': 'Sıra',
  'home.points': 'Puan',
  'home.goalDiff': 'Averaj',
  'home.last5': 'Son 5',
  'home.fullTable': 'Tüm puan durumu →',
  'home.latestNews': 'Son haberler',
  'home.allNews': 'Tüm haberler →',
  'home.table': 'Puan Durumu',
  'home.tableError': 'Puan durumu yüklenemedi',
  'home.noCompetitions': 'Bu sezon turnuva yok',
  'home.tableUnavailable': 'Puan durumu mevcut değil',
  'home.knockoutStage': 'Eleme turu',

  'fixtures.title': 'Fikstür',
  'fixtures.upcoming': 'Gelecek',
  'fixtures.results': 'Sonuçlar',
  'fixtures.error': 'Bu sezonun fikstürü yüklenemedi.',
  'fixtures.loading': 'Fikstür yükleniyor…',
  'fixtures.noneUpcoming': 'Bu sezon yaklaşan maç yok.',
  'fixtures.noneResults': 'Bu sezon sonuç yok.',
  'fixtures.note':
    'Süper Lig, Türkiye Kupası, Avrupa maçları ve hazırlık maçlarını içerir. Geçmiş sezonlardaki hazırlık maçları eksik olabilir.',

  'standings.title': 'Puan Durumu',
  'standings.error': 'Bu sezonun puan durumu yüklenemedi.',
  'standings.loading': 'Puan durumu yükleniyor…',
  'standings.noCompetitions': 'Bu sezon için turnuva bulunamadı.',
  'standings.noData': 'Bu turnuva için veri mevcut değil.',
  'standings.knockoutStage': 'Eleme turu',
  'standings.top4': 'İlk 4 Avrupa kupalarına katılma hakkı kazanır.',
  'standings.freeTier': 'Ücretsiz veri paketi puan durumunun yalnızca ilk sıralarını verir.',
  'standings.expandHint': 'Sezon karnesi için bir takıma dokunun.',

  'table.rank': '#',
  'table.club': 'Takım',
  'table.played': 'O',
  'table.won': 'G',
  'table.drawn': 'B',
  'table.lost': 'M',
  'table.goalsFor': 'A',
  'table.goalsAgainst': 'Y',
  'table.goalDiff': 'AV',
  'table.points': 'P',
  'table.form': 'Form',

  'team.seasonRecord': 'Sezon karnesi',
  'team.homeRecord': 'İç saha',
  'team.awayRecord': 'Deplasman',
  'team.results': 'Sonuçlar',
  'team.noResults': 'Bu sezon henüz maç oynanmadı.',
  'team.vsFener': 'Fenerbahçe ile karşılaşmalar →',

  'h2h.title': 'Fenerbahçe ile',
  'h2h.loading': 'Karşılaşmalar yükleniyor…',
  'h2h.error': 'Karşılaşma geçmişi yüklenemedi.',
  'h2h.none': 'Bu turnuvada Fenerbahçe ile kayıtlı karşılaşma yok.',
  'h2h.fenerWins': 'Fenerbahçe galibiyeti',
  'h2h.draws': 'Beraberlik',
  'h2h.opponentWins': 'Rakip galibiyeti',
  'h2h.meetings': 'Karşılaşma',
  'h2h.goals': 'Goller',
  'h2h.coverage':
    '{from} - {to} sezonlarını kapsar — bu veri kaynağının sunduğu sezonlar. Daha eski karşılaşmalar mevcut değil.',

  'squad.title': 'Kadro',
  'squad.players': '{n} oyuncu',
  'squad.all': 'Tümü',
  'squad.none': 'Gösterilecek oyuncu yok.',
  'squad.freeTier':
    'Kadro verileri TheSportsDB ücretsiz paketinden gelir; sınırlı bir kadro döner ve sezonluk maç istatistiği içermez.',

  'pos.Goalkeeper': 'Kaleci',
  'pos.Defender': 'Defans',
  'pos.Midfielder': 'Orta saha',
  'pos.Forward': 'Forvet',
  'posShort.Goalkeeper': 'KL',
  'posShort.Defender': 'DEF',
  'posShort.Midfielder': 'OS',
  'posShort.Forward': 'FOR',

  'player.years': '{n} yaş',
  'player.foot': 'Ayak',
  'player.weight': 'Kilo',
  'player.born': 'Doğum yeri',
  'player.signing': 'Transfer',
  'player.career': 'Kariyer',
  'player.honours': 'Kupalar',
  'player.formerClubs': 'Eski kulüpler',
  'player.loadingCareer': 'Kariyer yükleniyor…',
  'player.noCareer': 'Bu oyuncu için kariyer geçmişi mevcut değil.',
  'player.noStatsNote':
    'Bu veri kaynağı yalnızca oyuncu profili sunar — bu lig için maç istatistiği yayınlamaz.',

  'club.title': 'Kulüp',
  'club.unavailable': 'Kulüp bilgileri şu anda mevcut değil.',
  'club.facts': 'Kulüp bilgileri',
  'club.founded': 'Kuruluş',
  'club.capacity': 'Kapasite',
  'club.stadium': 'Stadyum',
  'club.nicknames': 'Lakaplar',
  'club.competesIn': 'Katıldığı turnuvalar',
  'club.officialLinks': 'Resmi bağlantılar',
  'club.fanArt': 'Taraftar sanatı',
  'club.kits': 'Formalar',

  'news.title': 'Haberler',
  'news.newest': 'En yeni',
  'news.oldest': 'En eski',
  'news.none': 'Şu anda haber yok.',
  'news.note': 'Google News üzerinden güvenilir birkaç kaynaktan derlenmiştir.',

  'status.loading': 'En güncel veriler yükleniyor…',
  'status.errorTitle': 'Veriler yüklenemedi',
  'status.tryAgain': 'Tekrar dene',
  'status.warnings': 'Bazı bölümler canlı kaynaktan yüklenemedi:',
  'status.crashed': 'Bir şeyler ters gitti.',
  'status.crashedHelp':
    'Lütfen sayfayı yenilemeyi deneyin. Sorun devam ederse bu sitenin verilerini temizlemek yardımcı olabilir.',
  'status.reload': 'Yenile',
}

export const strings = { en, tr }
export type Lang = keyof typeof strings

export const LANGUAGES: { code: Lang; label: string }[] = [
  { code: 'en', label: 'EN' },
  { code: 'tr', label: 'TR' },
]

// Date/number formatting locale for each UI language.
export const localeOf: Record<Lang, string> = { en: 'en-GB', tr: 'tr-TR' }
