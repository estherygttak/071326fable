// Scripture memory verse data (New International Version, NIV)
// Scripture quotations taken from The Holy Bible, New International Version® NIV®
// Copyright © 1973, 1978, 1984, 2011 by Biblica, Inc.™ Used by permission. All rights reserved worldwide.
// Themes: The Gospel / God With Us / The God Who Answers Prayer / World Evangelization

const BIBLE_VERSION = "NIV";

const THEMES = [
  {
    id: "gospel",
    name: "The Gospel",
    emoji: "✝️",
    color: "#b5543b",
    description: "The good news of salvation through the cross and resurrection of Jesus Christ",
  },
  {
    id: "immanuel",
    name: "God With Us",
    emoji: "🕊️",
    color: "#3b6e8f",
    description: "Immanuel — the God who is with me wherever I go",
  },
  {
    id: "prayer",
    name: "God Who Answers Prayer",
    emoji: "🙏",
    color: "#7a5c3e",
    description: "The faithful character of God who answers when we call",
  },
  {
    id: "mission",
    name: "World Evangelization",
    emoji: "🌍",
    color: "#4e7a4e",
    description: "God's heart to make disciples of all nations",
  },
];

const VERSES = [
  // ─────────────── The Gospel ───────────────
  {
    id: "john-3-16",
    theme: "gospel",
    ref: "John 3:16",
    text: "For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.",
  },
  {
    id: "rom-3-23",
    theme: "gospel",
    ref: "Romans 3:23",
    text: "For all have sinned and fall short of the glory of God.",
  },
  {
    id: "rom-6-23",
    theme: "gospel",
    ref: "Romans 6:23",
    text: "For the wages of sin is death, but the gift of God is eternal life in Christ Jesus our Lord.",
  },
  {
    id: "rom-5-8",
    theme: "gospel",
    ref: "Romans 5:8",
    text: "But God demonstrates his own love for us in this: While we were still sinners, Christ died for us.",
  },
  {
    id: "john-14-6",
    theme: "gospel",
    ref: "John 14:6",
    text: "Jesus answered, “I am the way and the truth and the life. No one comes to the Father except through me.”",
  },
  {
    id: "eph-2-8-9",
    theme: "gospel",
    ref: "Ephesians 2:8-9",
    text: "For it is by grace you have been saved, through faith—and this is not from yourselves, it is the gift of God—not by works, so that no one can boast.",
  },
  {
    id: "john-1-12",
    theme: "gospel",
    ref: "John 1:12",
    text: "Yet to all who did receive him, to those who believed in his name, he gave the right to become children of God.",
  },
  {
    id: "2cor-5-17",
    theme: "gospel",
    ref: "2 Corinthians 5:17",
    text: "Therefore, if anyone is in Christ, the new creation has come: The old has gone, the new is here!",
  },
  {
    id: "rom-10-9",
    theme: "gospel",
    ref: "Romans 10:9",
    text: "If you declare with your mouth, “Jesus is Lord,” and believe in your heart that God raised him from the dead, you will be saved.",
  },
  {
    id: "acts-4-12",
    theme: "gospel",
    ref: "Acts 4:12",
    text: "Salvation is found in no one else, for there is no other name under heaven given to mankind by which we must be saved.",
  },

  // ─────────────── God With Us ───────────────
  {
    id: "matt-1-23",
    theme: "immanuel",
    ref: "Matthew 1:23",
    text: "“The virgin will conceive and give birth to a son, and they will call him Immanuel” (which means “God with us”).",
  },
  {
    id: "matt-28-20",
    theme: "immanuel",
    ref: "Matthew 28:20",
    text: "And teaching them to obey everything I have commanded you. And surely I am with you always, to the very end of the age.",
  },
  {
    id: "josh-1-9",
    theme: "immanuel",
    ref: "Joshua 1:9",
    text: "Have I not commanded you? Be strong and courageous. Do not be afraid; do not be discouraged, for the LORD your God will be with you wherever you go.",
  },
  {
    id: "isa-41-10",
    theme: "immanuel",
    ref: "Isaiah 41:10",
    text: "So do not fear, for I am with you; do not be dismayed, for I am your God. I will strengthen you and help you; I will uphold you with my righteous right hand.",
  },
  {
    id: "ps-23-1",
    theme: "immanuel",
    ref: "Psalm 23:1",
    text: "The LORD is my shepherd, I lack nothing.",
  },
  {
    id: "ps-23-4",
    theme: "immanuel",
    ref: "Psalm 23:4",
    text: "Even though I walk through the darkest valley, I will fear no evil, for you are with me; your rod and your staff, they comfort me.",
  },
  {
    id: "deut-31-8",
    theme: "immanuel",
    ref: "Deuteronomy 31:8",
    text: "The LORD himself goes before you and will be with you; he will never leave you nor forsake you. Do not be afraid; do not be discouraged.",
  },
  {
    id: "ps-46-1",
    theme: "immanuel",
    ref: "Psalm 46:1",
    text: "God is our refuge and strength, an ever-present help in trouble.",
  },
  {
    id: "isa-43-2",
    theme: "immanuel",
    ref: "Isaiah 43:2",
    text: "When you pass through the waters, I will be with you; and when you pass through the rivers, they will not sweep over you. When you walk through the fire, you will not be burned; the flames will not set you ablaze.",
  },

  // ─────────────── God Who Answers Prayer ───────────────
  {
    id: "jer-33-3",
    theme: "prayer",
    ref: "Jeremiah 33:3",
    text: "Call to me and I will answer you and tell you great and unsearchable things you do not know.",
  },
  {
    id: "matt-7-7-8",
    theme: "prayer",
    ref: "Matthew 7:7-8",
    text: "Ask and it will be given to you; seek and you will find; knock and the door will be opened to you. For everyone who asks receives; the one who seeks finds; and to the one who knocks, the door will be opened.",
  },
  {
    id: "phil-4-6-7",
    theme: "prayer",
    ref: "Philippians 4:6-7",
    text: "Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God. And the peace of God, which transcends all understanding, will guard your hearts and your minds in Christ Jesus.",
  },
  {
    id: "1john-5-14",
    theme: "prayer",
    ref: "1 John 5:14",
    text: "This is the confidence we have in approaching God: that if we ask anything according to his will, he hears us.",
  },
  {
    id: "ps-50-15",
    theme: "prayer",
    ref: "Psalm 50:15",
    text: "And call on me in the day of trouble; I will deliver you, and you will honor me.",
  },
  {
    id: "lam-3-22-23",
    theme: "prayer",
    ref: "Lamentations 3:22-23",
    text: "Because of the LORD's great love we are not consumed, for his compassions never fail. They are new every morning; great is your faithfulness.",
  },
  {
    id: "1cor-10-13",
    theme: "prayer",
    ref: "1 Corinthians 10:13",
    text: "No temptation has overtaken you except what is common to mankind. And God is faithful; he will not let you be tempted beyond what you can bear. But when you are tempted, he will also provide a way out so that you can endure it.",
  },
  {
    id: "john-15-7",
    theme: "prayer",
    ref: "John 15:7",
    text: "If you remain in me and my words remain in you, ask whatever you wish, and it will be done for you.",
  },
  {
    id: "1thess-5-24",
    theme: "prayer",
    ref: "1 Thessalonians 5:24",
    text: "The one who calls you is faithful, and he will do it.",
  },

  // ─────────────── World Evangelization ───────────────
  {
    id: "matt-28-19",
    theme: "mission",
    ref: "Matthew 28:19",
    text: "Therefore go and make disciples of all nations, baptizing them in the name of the Father and of the Son and of the Holy Spirit.",
  },
  {
    id: "acts-1-8",
    theme: "mission",
    ref: "Acts 1:8",
    text: "But you will receive power when the Holy Spirit comes on you; and you will be my witnesses in Jerusalem, and in all Judea and Samaria, and to the ends of the earth.",
  },
  {
    id: "mark-16-15",
    theme: "mission",
    ref: "Mark 16:15",
    text: "He said to them, “Go into all the world and preach the gospel to all creation.”",
  },
  {
    id: "matt-24-14",
    theme: "mission",
    ref: "Matthew 24:14",
    text: "And this gospel of the kingdom will be preached in the whole world as a testimony to all nations, and then the end will come.",
  },
  {
    id: "rom-1-16",
    theme: "mission",
    ref: "Romans 1:16",
    text: "For I am not ashamed of the gospel, because it is the power of God that brings salvation to everyone who believes: first to the Jew, then to the Gentile.",
  },
  {
    id: "isa-6-8",
    theme: "mission",
    ref: "Isaiah 6:8",
    text: "Then I heard the voice of the Lord saying, “Whom shall I send? And who will go for us?” And I said, “Here am I. Send me!”",
  },
  {
    id: "hab-2-14",
    theme: "mission",
    ref: "Habakkuk 2:14",
    text: "For the earth will be filled with the knowledge of the glory of the LORD as the waters cover the sea.",
  },
  {
    id: "rev-7-9",
    theme: "mission",
    ref: "Revelation 7:9",
    text: "After this I looked, and there before me was a great multitude that no one could count, from every nation, tribe, people and language, standing before the throne and before the Lamb. They were wearing white robes and were holding palm branches in their hands.",
  },
  {
    id: "ps-96-3",
    theme: "mission",
    ref: "Psalm 96:3",
    text: "Declare his glory among the nations, his marvelous deeds among all peoples.",
  },
];
