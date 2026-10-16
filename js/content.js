/* ============================================================
   CONTENT: the text, lists and photo paths for the scrapbook.
   Edit this file to change what the pages say.
   Photos live in the images/ folder. To add one, drop the file in
   images/ and point to it, e.g.  img:"images/memories/my-photo.jpg"
   ============================================================ */

const CARS={calls:[
  "images/calls/call-01.jpg",
  "images/calls/call-02.jpg",
  "images/calls/call-03.jpg",
  "images/calls/call-04.jpg",
  "images/calls/call-05.jpg",
  "images/calls/call-06.jpg",
  "images/calls/call-07.jpg",
  "images/calls/call-08.jpg",
  "images/calls/call-09.jpg",
  "images/calls/call-10.jpg",
  "images/calls/call-11.jpg"
]};

const SHOTS=[
  "images/chats/chat-01.jpg",
  "images/chats/chat-02.jpg",
  "images/chats/chat-03.jpg",
  "images/chats/chat-04.jpg",
  "images/chats/chat-05.jpg",
  "images/chats/chat-06.jpg",
  "images/chats/chat-07.jpg",
  "images/chats/chat-08.jpg",
  "images/chats/chat-09.jpg",
  "images/chats/chat-10.jpg",
  "images/chats/chat-11.jpg",
  "images/chats/chat-12.jpg",
  "images/chats/chat-13.jpg",
  "images/chats/chat-14.jpg",
  "images/chats/chat-15.jpg",
  "images/chats/chat-16.jpg",
  "images/chats/chat-17.jpg"
];

/* ---------- defaults ---------- */
const LETTER=`I wanted to make you something you could keep. Not a message that disappears down a chat, but a little place that is only ours, made of the moments I carry with me.

There are two places on the map that matter to me now: the one under my feet, and the one you are standing in, a whole world away. And still, somehow, you are the first thing I think of when I wake and the last thing on my mind before I sleep. Distance has taught me something I never would have learned otherwise: someone can be far away and still feel like home.

You make ordinary days feel worth saving. Your laugh, the little things you say, the way you turn a small moment into a memory without even trying. I am grateful for every message, every call, every time you made me smile when I didn't think I could.

I don't know how to say all of it, so I put it here, page by page. Take your time with it. Every page is just a different way of saying the same thing: I love you, and I am so glad it's you.`;
const TEXTDEF={letter:LETTER};
const L=a=>a.map(t=>({t}));
const DEF={
 memories:[
  {id:1,img:"images/memories/memory-1-minecraft-birthday.jpg",date:"Add a date",cap:"My girlfriend built me a whole Minecraft world for my birthday."},
  {id:2,car:"calls",tall:true,date:"Add a date",cap:"The calls I keep going back to."},
  {id:3,img:"images/memories/memory-3-the-text.jpg",date:"Add a date",cap:"A tiny, ordinary moment that turned out to mean everything."},
  {id:4,img:"images/memories/memory-4-the-notes.jpg",date:"Add a date",cap:"The time we laughed way too hard."},
  {id:5,img:"images/memories/memory-5-laufey-cover.jpg",date:"Add a date",cap:"Something that made me think of you."},
  {id:6,img:"images/memories/memory-6-kuala-lumpur.jpg",date:"Add a date",cap:"A place we talked about, and one day will see."}],
 chat:[],
 reasons:L(["The way you make me laugh when I least expect it.","How you turn an ordinary day into something worth remembering.","Your kindness, especially when you think no one is noticing.","The sound of your voice when you are excited about something.","How easy it is to be completely myself with you.","The way you make a whole distance feel small."]),
 says:L(["That you are with me.", "That you love me.", "That I get to have the best girl in the world.", "That you chose me, and keep choosing me.", "Every call, even the quiet ones.", "That you are my person, my support, and my diary."]),
 habits:L(["To keep choosing you, every single day.", "To be honest with you, even when it is hard.", "To say sorry and really mean it.", "To always be on your side.", "To hug you for a very long time when we meet."]),
 favs:L(["That we can talk for hours and never run out of things to say.", "That we laugh at the silliest things.", "That sleeping on call feels like home.", "That we keep going, no matter the distance.", "That we were friends first."]),
 ordinary:L(["Calling every day","Sleeping on call","Playing games together","Watching shows together","Sending videos and pics to each other","Being each other's support and diary","Letting each other know what we're doing"]),
 timeline:[
  {date:"October 2023",title:"The day we met",text:"We met on a Discord server. I thought you were really fun and sweet, and unlike anyone else I had ever talked to."},
  {date:"Early December 2023",title:"Our first long conversation",text:"The one that went way past the time we planned, and I think we both knew something was different."},
  {date:"One week later",title:"The first time I knew",text:"I realised I really loved talking to you. There was nobody like you, and there still isn't."},
  {date:"4 January 2024",title:"The day we became us",text:"Best day of my life."},
  {date:"A day I won't forget",title:"The first time you called me your boyfriend",text:"We were playing Plato together for the first time. It was surreal. I had so much fun, and then you said it."},
  {date:"Today",title:"Still here, still falling",text:"Two places, one story."}
],
 someday:L(["The first thing I will do: give you a very big hug."]),
 day:L(["Wake up next to you and give you a morning kiss.", "Make you breakfast.", "Get ready for our trip together.", "Go out on dates, holding hands and hugging the whole way.", "Find a little caf\u00e9 and share dessert.", "Take silly photos of us everywhere.", "Walk with no plan and get a little lost together.", "Cook dinner together, and eat it slowly.", "Watch a show together, finally in the same room.", "Fall asleep next to you, no call needed."]),
 jar:L(["I'm thinking of you right now.", "You are my favorite hello and my hardest goodbye.", "I fall for you a little more every day.", "Wherever you are, that is where my heart is.", "You make me want to be better.", "Falling asleep on a call with you is my favorite way to end a day.", "I would choose you again on every January 4th.", "Every mile between us is just another reason to love you louder.", "You are my person, my diary, and my favorite notification.", "Whatever time it is where you are, my heart is already there.", "You turned a Discord server into the best thing that ever happened to me.", "Even on the days I am quiet, I am thinking of you.", "I never get tired of hearing your voice.", "You are my favorite part of every day, and my favorite thing to miss.", "One day the distance will just be a story we tell. Until then, I am yours from here.", "Thank you for staying. I will never take it for granted.", "I love you more than infinity. I checked.", "You are the reason I believe in forever.", "I can't wait to hug you for real.", "Someday, \"good night\" will be said in the same room.", "You are the best thing I ever found on the internet.", "Your voice is my favorite sound in the whole world.", "I smile every time your name shows up on my screen.", "You make the smallest moments feel enormous.", "Malaysia is waiting for us, and I plan to hold your hand the entire time.", "I am so proud of you, and I hope you know it.", "No distance is bigger than what I feel for you.", "You are my calm after a long day.", "Thank you for being my diary, my best friend, and my person.", "I choose you today, tomorrow, and every day after.", "If love had a time zone, it would be wherever you are.", "I fall asleep thinking of you and wake up wanting to tell you everything.", "You are not just my love. You are my home.", "Your hugs are going to be my favorite place in the world.", "I love you in every language, every time zone, and every season.", "You are the best part of my story.", "Every video call with you is the highlight of my day.", "I am so lucky it was you.", "Hold on to this: I am not going anywhere.", "I will always be on your side, even from the other side of the world.", "You deserve all the love in the world, and I plan to give you as much as I can.", "I am looking forward to a thousand ordinary Tuesdays with you.", "You make me believe in soulmates.", "I promise to keep choosing you, even when we are tired, busy, or far away."]),
 env:[
  {label:"Open when you miss me",text:"Close your eyes. I'm thinking of you too, and I'm counting the days."},
  {label:"Open when you need a smile",text:"Write something silly and sweet here."},
  {label:"Open when you cannot sleep",text:"Something soft to read, from me, to you."},
  {label:"Open when you doubt how loved you are",text:"You are loved. More than you know, and more every day."}],
 songs:[
  {title:"Just the Way You Are",note:"Bruno Mars — this one makes me think of you every time."},
  {title:"Radi",note:"The song I once sang for you."},
  {title:"Everybody Wants Somebody",note:"This one reminds me of you too."}
],
 quiz:[
  {q:"When did we become a thing?",a0:"14 February 2024",a1:"4 January 2023",a2:"4 January 2024",a3:"23 December 2023",c:2,note:"Best day of my life."},
  {q:"Who realised first that they had feelings for the other?",a0:"Me",a1:"You",a2:"At the exact same time",a3:"Neither of us, it just happened",c:1,note:"You did, and I am so glad you did."},
  {q:"When was our very first big argument?",a0:"23 December 2024",a1:"14 February 2024",a2:"7 April 2024",a3:"1 January 2025",c:0,note:"Our first big one, and we are still here."},
  {q:"What is my absolute favorite thing about you?",a0:"Your smile",a1:"Your soul",a2:"Your laugh",a3:"Your lips",c:1,note:"Everything else is just a bonus."},
  {q:"Do you remember where I was when we first video called?",a0:"At home",a1:"In the car",a2:"At work",a3:"In uni",c:3,note:"In uni, and I will never forget that call."},
  {q:"What was the very first thing I noticed about you?",a0:"Your smile",a1:"Your laugh",a2:"The way you talk",a3:"Your sense of humor",c:1,note:"And it is still my favorite sound."},
  {q:"Which one of us gets tomorrow first?",a0:"Me",a1:"You",a2:"We are on the same clock",a3:"It depends on the day",c:1,note:"You do. So you can always tell me how it goes."},
  {q:"What do I do the moment I get a message from you?",a0:"Smile like an idiot",a1:"Reply instantly",a2:"Both, obviously",a3:"Pretend to stay calm",c:2,note:"Every single time."},
  {q:"What is my favorite thing to do with you?",a0:"Talk until sunrise",a1:"Watch something together",a2:"Play games",a3:"Do absolutely nothing, together",c:0,note:"Time just disappears."},
  {q:"What am I looking forward to the most?",a0:"The first hug",a1:"Our first dinner together",a2:"Seeing your city",a3:"All of it",c:3,note:"Every bit of it, with you."},
  {q:"On a scale from 1 to 10, how much do I love you?",a0:"8",a1:"10",a2:"100",a3:"More than infinity",c:3,note:"And it keeps growing."}]
};
