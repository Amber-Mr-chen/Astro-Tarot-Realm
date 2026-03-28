export const TAROT_CARDS = [
  'The Fool', 'The Magician', 'The High Priestess', 'The Empress', 'The Emperor',
  'The Hierophant', 'The Lovers', 'The Chariot', 'Strength', 'The Hermit',
  'Wheel of Fortune', 'Justice', 'The Hanged Man', 'Death', 'Temperance',
  'The Devil', 'The Tower', 'The Star', 'The Moon', 'The Sun',
  'Judgement', 'The World',
  'Ace of Wands', 'Two of Wands', 'Three of Wands', 'Four of Wands',
  'Five of Wands', 'Six of Wands', 'Seven of Wands', 'Eight of Wands',
  'Nine of Wands', 'Ten of Wands', 'Page of Wands', 'Knight of Wands',
  'Queen of Wands', 'King of Wands',
  'Ace of Cups', 'Two of Cups', 'Three of Cups', 'Four of Cups',
  'Five of Cups', 'Six of Cups', 'Seven of Cups', 'Eight of Cups',
  'Nine of Cups', 'Ten of Cups', 'Page of Cups', 'Knight of Cups',
  'Queen of Cups', 'King of Cups',
  'Ace of Swords', 'Two of Swords', 'Three of Swords', 'Four of Swords',
  'Five of Swords', 'Six of Swords', 'Seven of Swords', 'Eight of Swords',
  'Nine of Swords', 'Ten of Swords', 'Page of Swords', 'Knight of Swords',
  'Queen of Swords', 'King of Swords',
  'Ace of Pentacles', 'Two of Pentacles', 'Three of Pentacles', 'Four of Pentacles',
  'Five of Pentacles', 'Six of Pentacles', 'Seven of Pentacles', 'Eight of Pentacles',
  'Nine of Pentacles', 'Ten of Pentacles', 'Page of Pentacles', 'Knight of Pentacles',
  'Queen of Pentacles', 'King of Pentacles',
]

export const ZODIAC_SIGNS = [
  { name: 'Aries', symbol: '♈', dates: 'Mar 21 - Apr 19', emoji: '🔥', color: '#E74C3C', bg: 'rgba(231,76,60,0.15)' },
  { name: 'Taurus', symbol: '♉', dates: 'Apr 20 - May 20', emoji: '🌿', color: '#27AE60', bg: 'rgba(39,174,96,0.15)' },
  { name: 'Gemini', symbol: '♊', dates: 'May 21 - Jun 20', emoji: '🌬️', color: '#F1C40F', bg: 'rgba(241,196,15,0.15)' },
  { name: 'Cancer', symbol: '♋', dates: 'Jun 21 - Jul 22', emoji: '🌊', color: '#85C1E9', bg: 'rgba(133,193,233,0.15)' },
  { name: 'Leo', symbol: '♌', dates: 'Jul 23 - Aug 22', emoji: '☀️', color: '#F39C12', bg: 'rgba(243,156,18,0.15)' },
  { name: 'Virgo', symbol: '♍', dates: 'Aug 23 - Sep 22', emoji: '🌾', color: '#A9CCE3', bg: 'rgba(169,204,227,0.15)' },
  { name: 'Libra', symbol: '♎', dates: 'Sep 23 - Oct 22', emoji: '⚖️', color: '#D7BDE2', bg: 'rgba(215,189,226,0.15)' },
  { name: 'Scorpio', symbol: '♏', dates: 'Oct 23 - Nov 21', emoji: '🦂', color: '#C0392B', bg: 'rgba(192,57,43,0.2)' },
  { name: 'Sagittarius', symbol: '♐', dates: 'Nov 22 - Dec 21', emoji: '🏹', color: '#8E44AD', bg: 'rgba(142,68,173,0.15)' },
  { name: 'Capricorn', symbol: '♑', dates: 'Dec 22 - Jan 19', emoji: '🏔️', color: '#95A5A6', bg: 'rgba(149,165,166,0.2)' },
  { name: 'Aquarius', symbol: '♒', dates: 'Jan 20 - Feb 18', emoji: '⚡', color: '#5DADE2', bg: 'rgba(93,173,226,0.15)' },
  { name: 'Pisces', symbol: '♓', dates: 'Feb 19 - Mar 20', emoji: '🐠', color: '#76D7C4', bg: 'rgba(118,215,196,0.15)' },
]

export function drawRandomCard(): { name: string; isReversed: boolean } {
  const name = TAROT_CARDS[Math.floor(Math.random() * TAROT_CARDS.length)]
  const isReversed = Math.random() > 0.5
  return { name, isReversed }
}
