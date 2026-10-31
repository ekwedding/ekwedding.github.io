/* ================= CONTENT: everything the couple edits lives here (DEMO = placeholder) ================= */
export const CONTENT={
  names:{el:["Ευάγγελος","Κωνσταντίνα"],en:["Evangelos","Konstantina"],de:["Evangelos","Konstantina"],ro:["Evangelos","Konstantina"]},
  startUTC:"20270820T160000Z",endUTC:"20270821T000000Z",            /* 19:00–03:00 Athens time */
  venue:{name:"Κτήμα (DEMO)",addr:"Κορωπί, Αττική",maps:"https://www.google.com/maps/search/?api=1&query=Koropi"},
  schedule:[["19:00","arrive"],["19:30","ceremony"],["21:00","dinner"],["23:30","party"]],
  /* photos for "how we got here": put files in assets/photos and set src, null = drawn placeholder */
  story:[{city:"Θήβα",src:"assets/photo-1.jpg",stamp:"2011"},{city:"Αθήνα",src:"assets/photo-2.jpg"},{city:"Κυψέλη",src:"assets/photo-3.jpg"},{city:"Frankfurt",src:"assets/photo-4.jpg"},{city:"Stuttgart",src:"assets/photo-5.jpg"}],
  years:[{y:2011,src:"assets/year-2011.jpg"},{y:2012,src:"assets/year-2012.jpg"},{y:2013,src:"assets/year-2013.jpg"},{y:2014,src:"assets/year-2014.jpg"},{y:2015,src:"assets/year-2015.jpg"},{y:2016,src:"assets/year-2016.jpg"},{y:2017,src:"assets/year-2017.jpg"},{y:2018,src:"assets/year-2018.jpg"},{y:2019,src:"assets/year-2019.jpg"},{y:2020,src:"assets/year-2020.jpg"},{y:2021,src:"assets/year-2021.jpg"},{y:2022,src:"assets/year-2022.jpg"},{y:2023,src:"assets/year-2023.jpg"},{y:2024,src:"assets/year-2024.jpg"},{y:2025,src:"assets/year-2025.jpg"},{y:2026,src:"assets/year-2026.jpg"}],
  album:"https://photos.icloud.com/shared/album/022Ho8qTnPNUezFUi4fYDlXkw",
  /* dinner menu at the estate. PLACEHOLDERS */
  menu:{el:[["Ορεκτικά","Ποικιλία με τυριά, ντάκοι, φάβα (DEMO)"],["Σαλάτα","Χωριάτικη με κρίθινο παξιμάδι (DEMO)"],["Κυρίως","Μοσχαράκι ή λαβράκι (DEMO)"],["Γλυκό","Γαμήλια τούρτα (DEMO)"]],en:[["Starters","Cheeses, dakos, fava (DEMO)"],["Salad","Greek salad with barley rusk (DEMO)"],["Main","Veal or sea bass (DEMO)"],["Dessert","Wedding cake (DEMO)"]]},
  drinks:["aperol","gin","mojito","whisky","wine","beer"],
  honey:["namerica","samerica","oceania","antarctica"],      /* continents we have not been to yet */
  backend:{projectId:"",apiKey:""},
  /* Google Apps Script web-app URL (tools/sheets/Code.gs); empty = answers stay on the phone */
  sheet:"https://script.google.com/macros/s/AKfycbyXsQxEqpwThf_YAv5o1yZVHXoVl8OiKRJQw1J4kpEOkjMKFUAl4oHK2LMycmeP4wcG3w/exec",                                    /* Firestore; empty = demo, answers stay on the device */
  demo:true,
  /* gifts (post office desk). PLACEHOLDERS: put the real details here; empty = row hidden */
  gift:{holder:"ΟΝΟΜΑΤΕΠΩΝΥΜΟ (DEMO)",iban:"GR00 0000 0000 0000 0000 0000 000",revolut:"demo",iris:"69X XXX XXXX"},
  /* useful information for the simple version: [title, text] per language. PLACEHOLDERS */
  info:{el:[["Ντύσιμο","Καλοκαιρινό κομψό. Ανοιχτά χρώματα, άνετα παπούτσια για χώμα και γρασίδι."],["Παιδιά","Ο γάμος είναι μόνο για ενήλικες. Σας ευχαριστούμε για την κατανόηση."],["Πάρκινγκ","Υπάρχει δωρεάν πάρκινγκ στο κτήμα."],["Επιστροφή","Θα υπάρχουν ταξί στο τέλος της βραδιάς."]],
        en:[["Dress code","Summer elegant. Light colours, comfortable shoes for gravel and grass."],["Children","The wedding is adults only. Thank you for understanding."],["Parking","Free parking at the venue."],["Getting home","Taxis will be available at the end of the night."]]},
  /* VIP den, for close friends only. PLACEHOLDERS */
  vip:{el:[["Πού ετοιμαζόμαστε","Στις Komos Villas. Εδώ θα ετοιμαστούμε: σας περιμένουμε πριν και μετά τον γάμο για μπάνιο και ετοιμασία."],["Τι να φέρετε","Τα ρούχα σας για να ντυθείτε και μαγιό για να κάνουμε μπάνιο."],["Μετά τον γάμο","After party μέχρι το πρωί (DEMO)"],["Την επόμενη μέρα","Θάλασσα και φαγητό όλοι μαζί (DEMO)"]],
       en:[["Where we get ready","At Komos Villas. This is where we'll get ready: join us before and after the wedding for a swim and to get ready."],["What to bring","Your clothes to change into and a swimsuit for a swim."],["After the wedding","After party until the morning (DEMO)"],["The next day","Beach and food all together (DEMO)"]]},
  villa:"https://www.booking.com/hotel/gr/komos-villas-by-airstay.html?checkin=2027-07-30&checkout=2027-08-02",
  /* YouTube videos: the TV in the den, and the tablet (put your own video id here later) */
  tvVideo:"KHdETjg4BsY",proposal:"assets/proposal.mp4",tabletVideo:"cwgodJ4pmzQ",
  /* the den leaderboard */
  board:[["junkienadina",20],["kofinisevan",18],["mariastrid",15],["vasglar",0]]
};

export const T={
el:{when:"Παρασκευή",koropi:"Κορωπί",playG:"Παίξε ως",playB:"Παίξε ως",loading:"Φόρτωση…",stops:"Στάσεις",stopsH:"Οι στάσεις σου",tapGo:"Πάτα μια στάση για να πας εκεί",simple:"Απλή έκδοση",vespaH:"Πού πάμε;",
 go:"Πήγαινε",done:"Έγινε",locked:"Κλειστό",close:"Κλείσιμο",exit:"Έξοδος",hint:"Πάτα στο έδαφος για να περπατήσεις ή πάτα μια ετικέτα. Σύρε για να γυρίσεις την κάμερα.",
 next:"Επόμενο",nextStop:"Επόμενη στάση",allDone:"Τα έκανες όλα. Το πρακτορείο ταξιδιών άνοιξε!",lockedMsg:"Το πρακτορείο ανοίγει όταν τελειώσεις όλες τις άλλες στάσεις.",
 wave:"Πάμε!",
 P:{estate:"Το κτήμα",gallery:"Η γκαλερί",chapel:"Η εκκλησία",club:"Το club",post:"Το ταχυδρομείο",agency:"Πρακτορείο ταξιδιών"},
 Q:{date:["Κράτα την ημερομηνία","Βάλε τον γάμο στο ημερολόγιο"],story:["Πώς φτάσαμε εδώ","Δες τις φωτογραφίες μας"],bless:["Η ευχή του παπά","Πάρε την ευλογία"],dance:["Χόρεψε μαζί μας","Στο club"],wish:["Στείλε μας ευχές","Γράψε μας δυο λόγια"],honey:["Ταξίδι του μέλιτος","Ψήφισε κρυφά πού θα πάμε"]},
 dateH:"Παρασκευή 20 Αυγούστου 2027",dateP:"Ο γάμος μας στο Κορωπί. Με ένα πάτημα μπαίνουν όλα στο ημερολόγιό σου: ώρα, τοποθεσία, πρόγραμμα και υπενθύμιση μια εβδομάδα πριν.",
 addCal:"Στο ημερολόγιο",gcal:"Google Calendar",maps:"Χάρτης",rsvpH:"Θα έρθεις;",yourName:"Το όνομά σου",yes:"Ναι, θα έρθω",no:"Δυστυχώς όχι",guests:"Πόσα άτομα",send:"Αποστολή",thanks:"Ευχαριστούμε! Το λάβαμε.",thanksLocal:"Ευχαριστούμε! Αποθηκεύτηκε σε αυτή τη συσκευή (δοκιμαστική έκδοση).",
 sched:{arrive:"Υποδοχή",ceremony:"Τελετή",dinner:"Δείπνο",party:"Πάρτι"},
 storyH:"Πώς φτάσαμε εδώ",storyT:["Γνωριστήκαμε σε ένα μαγαζί στη Θήβα.","Μετά ζήσαμε μαζί στην Αθήνα.","Η Κυψέλη, η γειτονιά μας στην Αθήνα.","Η Φρανκφούρτη μας έμαθε τον χειμώνα.","Στη Στουτγάρδη φτιάξαμε σπίτι."],
 blessH:"Η ευχή του παπά",blessP:"«Να ζήσετε, να γεράσετε μαζί, με αγάπη και υγεία. Και όσοι ήρθατε, να είστε πάντα καλά.» Η τελετή αρχίζει στις 19:30.",blessBtn:"Πάρε την ευχή",
 danceH:"Η πίστα είναι δική σας",danceP:"Οι φίλοι μας ήδη χορεύουν. Το πάρτι αρχίζει στις 23:30.",danceBtn:"Χόρεψε!",
 wishH:"Στείλε μας ευχές",wishP:"Γράψε μας ό,τι θέλεις. Θα τις διαβάσουμε μετά τον γάμο.",wishText:"Η ευχή σου",
 honeyH:"Πού να πάμε ταξίδι του μέλιτος;",honeyP:"Η ψήφος σου μένει κρυφή μέχρι τον γάμο. Φαίνεται μόνο πόσοι ψήφισαν.",voted:"ψήφισαν",vote:"Ψήφισε",honeyDone:"Η ψήφος σου μετρήθηκε. Τα αποτελέσματα στο πάρτι!",
 opt:{namerica:"Βόρεια Αμερική",samerica:"Νότια Αμερική",oceania:"Ωκεανία",antarctica:"Ανταρκτική"},demoNote:"Δοκιμαστικά στοιχεία, θα αλλάξουν.",photoDemo:"Η φωτογραφία θα μπει σύντομα.",calTitle:"Γάμος Ευάγγελου & Κωνσταντίνας",back:"Πίσω στο παιχνίδι",music:"Μουσική"},
en:{when:"Friday",koropi:"Koropi",playG:"Play as",playB:"Play as",loading:"Loading…",stops:"Stops",stopsH:"Your stops",tapGo:"Tap a stop to go there",simple:"Simple version",vespaH:"Where to?",
 go:"Go",done:"Done",locked:"Closed",close:"Close",exit:"Exit",hint:"Tap the ground or a label to walk. Drag to turn the camera.",
 next:"Next",nextStop:"Next stop",allDone:"You did them all. The travel agency is open!",lockedMsg:"The travel agency opens once you finish every other stop.",
 wave:"Let's go!",
 P:{estate:"The estate",gallery:"The gallery",chapel:"The chapel",club:"The club",post:"The post office",agency:"Travel agency"},
 Q:{date:["Save the date","Put the wedding in your calendar"],story:["How we got here","See our photos"],bless:["The priest's blessing","Receive the blessing"],dance:["Dance with us","At the club"],wish:["Send us wishes","Write us a few words"],honey:["Honeymoon","Secretly vote where we go"]},
 dateH:"Friday 20 August 2027",dateP:"Our wedding in Koropi. One tap adds everything to your calendar: time, place, schedule and a reminder a week before.",
 addCal:"Add to calendar",gcal:"Google Calendar",maps:"Map",rsvpH:"Will you come?",yourName:"Your name",yes:"Yes, I'll be there",no:"Sadly not",guests:"How many people",send:"Send",thanks:"Thank you! We got it.",thanksLocal:"Thank you! Saved on this device (demo version).",
 sched:{arrive:"Welcome",ceremony:"Ceremony",dinner:"Dinner",party:"Party"},
 storyH:"How we got here",storyT:["We met in a shop in Thiva.","Then we lived together in Athens.","Kypseli, our neighbourhood in Athens.","Frankfurt taught us winter.","In Stuttgart we made a home."],
 blessH:"The priest's blessing",blessP:"“Live long and grow old together, with love and health. And may all of you who came always be well.” The ceremony begins at 19:30.",blessBtn:"Receive the blessing",
 danceH:"The dance floor is yours",danceP:"Our friends are already dancing. The party starts at 23:30.",danceBtn:"Dance!",
 wishH:"Send us your wishes",wishP:"Write whatever you like. We'll read them after the wedding.",wishText:"Your wish",
 honeyH:"Where should we go on honeymoon?",honeyP:"Your vote stays secret until the wedding. Only the number of voters is shown.",voted:"voted",vote:"Vote",honeyDone:"Your vote counts. Results at the party!",
 opt:{namerica:"North America",samerica:"South America",oceania:"Oceania",antarctica:"Antarctica"},demoNote:"Demo details, will change.",photoDemo:"The photo is coming soon.",calTitle:"Wedding of Evangelos & Konstantina",back:"Back to the game",music:"Music"},
de:{when:"Freitag",koropi:"Koropi",playG:"Spiele als",playB:"Spiele als",loading:"Lädt…",stops:"Stationen",stopsH:"Deine Stationen",tapGo:"Tippe auf eine Station, um hinzugehen",simple:"Einfache Version",vespaH:"Wohin?",
 go:"Los",done:"Erledigt",locked:"Geschlossen",close:"Schließen",exit:"Ausgang",hint:"Tippe auf den Boden oder ein Schild, um zu gehen. Ziehen dreht die Kamera.",
 next:"Weiter",nextStop:"Nächste Station",allDone:"Alles erledigt. Das Reisebüro hat geöffnet!",lockedMsg:"Das Reisebüro öffnet, wenn alle anderen Stationen erledigt sind.",
 wave:"Los geht's!",
 P:{estate:"Das Weingut",gallery:"Die Galerie",chapel:"Die Kirche",club:"Der Club",post:"Die Post",agency:"Reisebüro"},
 Q:{date:["Termin speichern","Die Hochzeit in deinen Kalender"],story:["Wie wir hierher kamen","Sieh dir unsere Fotos an"],bless:["Der Segen des Priesters","Empfange den Segen"],dance:["Tanz mit uns","Im Club"],wish:["Schick uns Wünsche","Schreib uns ein paar Worte"],honey:["Flitterwochen","Stimme geheim über das Ziel ab"]},
 dateH:"Freitag, 20. August 2027",dateP:"Unsere Hochzeit in Koropi. Ein Tipp trägt alles in deinen Kalender ein: Zeit, Ort, Ablauf und eine Erinnerung eine Woche vorher.",
 addCal:"In den Kalender",gcal:"Google Kalender",maps:"Karte",rsvpH:"Kommst du?",yourName:"Dein Name",yes:"Ja, ich komme",no:"Leider nicht",guests:"Wie viele Personen",send:"Senden",thanks:"Danke! Angekommen.",thanksLocal:"Danke! Auf diesem Gerät gespeichert (Testversion).",
 sched:{arrive:"Empfang",ceremony:"Trauung",dinner:"Abendessen",party:"Party"},
 storyH:"Wie wir hierher kamen",storyT:["Wir haben uns in einem Laden in Theben kennengelernt.","Dann lebten wir zusammen in Athen.","Kypseli, unser Viertel in Athen.","Frankfurt hat uns den Winter gelehrt.","In Stuttgart haben wir ein Zuhause gefunden."],
 blessH:"Der Segen des Priesters",blessP:"„Lebt lange und werdet gemeinsam alt, in Liebe und Gesundheit. Und allen, die gekommen sind, soll es immer gut gehen.“ Die Trauung beginnt um 19:30.",blessBtn:"Segen empfangen",
 danceH:"Die Tanzfläche gehört euch",danceP:"Unsere Freunde tanzen schon. Die Party beginnt um 23:30.",danceBtn:"Tanzen!",
 wishH:"Schick uns deine Wünsche",wishP:"Schreib, was du möchtest. Wir lesen alles nach der Hochzeit.",wishText:"Dein Wunsch",
 honeyH:"Wohin sollen wir in die Flitterwochen?",honeyP:"Deine Stimme bleibt bis zur Hochzeit geheim. Nur die Zahl der Stimmen ist sichtbar.",voted:"haben abgestimmt",vote:"Abstimmen",honeyDone:"Deine Stimme zählt. Ergebnis auf der Party!",
 opt:{namerica:"Nordamerika",samerica:"Südamerika",oceania:"Ozeanien",antarctica:"Antarktis"},demoNote:"Testdaten, ändern sich noch.",photoDemo:"Das Foto kommt bald.",calTitle:"Hochzeit von Evangelos & Konstantina",back:"Zurück zum Spiel",music:"Musik"},
ro:{when:"Vineri",koropi:"Koropi",playG:"Joacă ca",playB:"Joacă ca",loading:"Se încarcă…",stops:"Opriri",stopsH:"Opririle tale",tapGo:"Atinge o oprire ca să mergi acolo",simple:"Versiunea simplă",vespaH:"Unde mergem?",
 go:"Mergi",done:"Gata",locked:"Închis",close:"Închide",exit:"Ieșire",hint:"Atinge solul sau o etichetă ca să mergi. Trage ca să rotești camera.",
 next:"Următor",nextStop:"Următoarea oprire",allDone:"Le-ai făcut pe toate. Agenția de turism s-a deschis!",lockedMsg:"Agenția se deschide după ce termini toate celelalte opriri.",
 wave:"Hai!",
 P:{estate:"Domeniul",gallery:"Galeria",chapel:"Biserica",club:"Clubul",post:"Poșta",agency:"Agenție de turism"},
 Q:{date:["Salvează data","Pune nunta în calendar"],story:["Cum am ajuns aici","Vezi fotografiile noastre"],bless:["Binecuvântarea preotului","Primește binecuvântarea"],dance:["Dansează cu noi","La club"],wish:["Trimite-ne urări","Scrie-ne câteva cuvinte"],honey:["Luna de miere","Votează în secret destinația"]},
 dateH:"Vineri, 20 august 2027",dateP:"Nunta noastră în Koropi. O atingere adaugă totul în calendar: ora, locul, programul și o amintire cu o săptămână înainte.",
 addCal:"În calendar",gcal:"Google Calendar",maps:"Hartă",rsvpH:"Vii?",yourName:"Numele tău",yes:"Da, vin",no:"Din păcate nu",guests:"Câte persoane",send:"Trimite",thanks:"Mulțumim! Am primit.",thanksLocal:"Mulțumim! Salvat pe acest dispozitiv (versiune de test).",
 sched:{arrive:"Primire",ceremony:"Cununie",dinner:"Cină",party:"Petrecere"},
 storyH:"Cum am ajuns aici",storyT:["Ne-am cunoscut într-un magazin din Teba.","Apoi am locuit împreună în Atena.","Kypseli, cartierul nostru din Atena.","Frankfurtul ne-a învățat iarna.","În Stuttgart ne-am făcut un cămin."],
 blessH:"Binecuvântarea preotului",blessP:"„Să trăiți mult și să îmbătrâniți împreună, cu dragoste și sănătate. Și toți cei veniți să fie mereu bine.” Cununia începe la 19:30.",blessBtn:"Primește binecuvântarea",
 danceH:"Ringul e al vostru",danceP:"Prietenii noștri dansează deja. Petrecerea începe la 23:30.",danceBtn:"Dansează!",
 wishH:"Trimite-ne urări",wishP:"Scrie ce vrei. Le citim după nuntă.",wishText:"Urarea ta",
 honeyH:"Unde să mergem în luna de miere?",honeyP:"Votul tău rămâne secret până la nuntă. Se vede doar câți au votat.",voted:"au votat",vote:"Votează",honeyDone:"Votul tău contează. Rezultatele la petrecere!",
 opt:{namerica:"America de Nord",samerica:"America de Sud",oceania:"Oceania",antarctica:"Antarctica"},demoNote:"Date de test, se vor schimba.",photoDemo:"Fotografia vine în curând.",calTitle:"Nunta lui Evangelos & Konstantina",back:"Înapoi la joc",music:"Muzică"}
};


/* strings added with the interiors, guests and chat */
const MORE={
el:{guide:{chapel:"Πήγαινε στον παπά για την ευχή του.",gallery:"Δες τις φωτογραφίες στον τοίχο.",estate:"Πήγαινε στο καβαλέτο με την πρόσκληση.",club:"Βγες στην πίστα και χόρεψε!",post:"Κάτσε στο γραφείο και γράψε μας μια ευχή.",agency:"Πήγαινε στο γραφείο του πράκτορα."},
  spot:{chapel:"Ο παπάς",gallery:"Οι φωτογραφίες",estate:"Η πρόσκληση",club:"Η πίστα",post:"Βιβλίο ευχών",agency:"Ο πράκτορας"},exitLbl:"Έξοδος",exitHint:"Έξοδος: η πόρτα μπροστά",
  priestSays:"Ο Θεός να ευλογεί το ζευγάρι και όλους εσάς!",chantOn:"Άνοιξε τον ήχο για να ακούσεις τον ψάλτη.",clubName:"Beach club"},
en:{guide:{chapel:"Walk to the priest for his blessing.",gallery:"Look at the photos on the wall.",estate:"Walk to the easel with the invitation.",club:"Step onto the dance floor and dance!",post:"Sit at the desk and write us a wish.",agency:"Walk to the travel agent's desk."},
  spot:{chapel:"The priest",gallery:"The photos",estate:"The invitation",club:"Dance floor",post:"Wish book",agency:"The agent"},exitLbl:"Exit",exitHint:"Exit: the door in front",
  priestSays:"God bless the couple and all of you!",chantOn:"Turn the sound on to hear the chanter.",clubName:"Beach club"},
de:{guide:{chapel:"Geh zum Priester für seinen Segen.",gallery:"Sieh dir die Fotos an der Wand an.",estate:"Geh zur Staffelei mit der Einladung.",club:"Ab auf die Tanzfläche!",post:"Setz dich an den Tisch und schreib uns einen Wunsch.",agency:"Geh zum Schreibtisch des Reisebüros."},
  spot:{chapel:"Der Priester",gallery:"Die Fotos",estate:"Die Einladung",club:"Tanzfläche",post:"Wunschbuch",agency:"Reiseberater"},exitLbl:"Ausgang",exitHint:"Ausgang: die Tür vorne",
  priestSays:"Gott segne das Paar und euch alle!",chantOn:"Schalte den Ton ein, um den Gesang zu hören.",clubName:"Beach club"},
ro:{guide:{chapel:"Mergi la preot pentru binecuvântare.",gallery:"Privește fotografiile de pe perete.",estate:"Mergi la șevaletul cu invitația.",club:"Ieși pe ring și dansează!",post:"Stai la birou și scrie-ne o urare.",agency:"Mergi la biroul agentului."},
  spot:{chapel:"Preotul",gallery:"Fotografiile",estate:"Invitația",club:"Ringul",post:"Cartea de urări",agency:"Agentul"},exitLbl:"Ieșire",exitHint:"Ieșire: ușa din față",
  priestSays:"Dumnezeu să binecuvânteze mirii și pe voi toți!",chantOn:"Pornește sunetul ca să auzi cântarea.",clubName:"Beach club"}};
for(const l in MORE)Object.assign(T[l],MORE[l]);

/* secret windmill, teleports, Sims-style menus, moods, selfie, club music */
CONTENT.secret={code:"",hash:"cd2c5a21",whatsapp:"306971817492"};   /* hash of the 4-digit code (fnv1a); change with tools/hash_code.py */
const MORE2={
el:{secretH:"Ένας μυστικός ανεμόμυλος",secretP:"Αυτή η πόρτα ανοίγει μόνο αν σου το επιτρέψει το ζευγάρι. Ο κωδικός έχει σχέση με το ζευγάρι.",codeLbl:"Κωδικός 4 ψηφίων",enter:"Μπες",wrong:"Λάθος κωδικός. Δοκίμασε ξανά ή πάρε τον γαμπρό.",
  waBtn:"Πάρε τον γαμπρό στο WhatsApp",waText:"Βρήκα τον κρυφό ανεμόμυλο! Μου λες τον κωδικό;",denH:"Συγχαρητήρια! Βρήκες το κρυφό κτίριο",denP:"Εδώ είναι μόνο οι πολύ καλοί μας φίλοι. Καναπέδες, παιχνίδια, κουβέντα. Εδώ μπορούμε να είμαστε ο εαυτός μας.",denSpot:"Ο καναπές",denGuide:"Κάτσε στον καναπέ με την παρέα.",
  teleport:"Τηλεμεταφορά",simpleStops:"Όλες οι στάσεις",simpleNote:"Πάτα «Τηλεμεταφορά» για να βρεθείς κατευθείαν μέσα στο κτίριο.",nextGo:"→",
  pie:{kiss:"Φιλάκι",kisslong:"Αγκαλιά & φιλί",dance:"Χορός",chat:"Κουβέντα",selfie:"Selfie",wave:"Χαιρέτα",sit:"Κάτσε"},moods:{fun:"Κέφι",love:"Αγάπη",party:"Πάρτι"},
  selfieH:"Η φωτογραφία σας",save:"Αποθήκευση",share:"Στείλ' τη",clubTracks:"Διάλεξε τραγούδι",credits:"Μουσική club: Kevin MacLeod (incompetech.com), CC BY 4.0"},
en:{secretH:"A secret windmill",secretP:"This door opens only if the couple lets you in. The code has to do with the couple.",codeLbl:"4-digit code",enter:"Enter",wrong:"Wrong code. Try again or call the groom.",
  waBtn:"Call the groom on WhatsApp",waText:"I found the secret windmill! What's the code?",denH:"Congratulations! You found the secret building",denP:"Only our closest friends are here. Sofas, games, good talk. Here we can be ourselves.",denSpot:"The sofa",denGuide:"Sit on the sofa with the gang.",
  teleport:"Teleport",simpleStops:"All stops",simpleNote:"Tap “Teleport” to land straight inside the building.",nextGo:"→",
  pie:{kiss:"Kiss",kisslong:"Hug & kiss",dance:"Dance",chat:"Chat",selfie:"Selfie",wave:"Wave",sit:"Sit"},moods:{fun:"Fun",love:"Love",party:"Party"},
  selfieH:"Your photo",save:"Save",share:"Share",clubTracks:"Pick a song",credits:"Club music: Kevin MacLeod (incompetech.com), CC BY 4.0"},
de:{secretH:"Eine geheime Windmühle",secretP:"Diese Tür öffnet sich nur, wenn das Paar es erlaubt. Der Code hat mit dem Paar zu tun.",codeLbl:"4-stelliger Code",enter:"Eintreten",wrong:"Falscher Code. Versuch es nochmal oder ruf den Bräutigam an.",
  waBtn:"Bräutigam auf WhatsApp anrufen",waText:"Ich habe die geheime Windmühle gefunden! Wie lautet der Code?",denH:"Glückwunsch! Du hast das geheime Gebäude gefunden",denP:"Hier sind nur unsere engsten Freunde. Sofas, Spiele, gute Gespräche. Hier können wir ganz wir selbst sein.",denSpot:"Das Sofa",denGuide:"Setz dich mit der Clique aufs Sofa.",
  teleport:"Teleport",simpleStops:"Alle Stationen",simpleNote:"Tippe auf „Teleport“, um direkt im Gebäude zu landen.",nextGo:"→",
  pie:{kiss:"Küsschen",kisslong:"Umarmen & küssen",dance:"Tanzen",chat:"Plaudern",selfie:"Selfie",wave:"Winken",sit:"Setzen"},moods:{fun:"Spaß",love:"Liebe",party:"Party"},
  selfieH:"Euer Foto",save:"Speichern",share:"Teilen",clubTracks:"Wähle ein Lied",credits:"Club-Musik: Kevin MacLeod (incompetech.com), CC BY 4.0"},
ro:{secretH:"O moară de vânt secretă",secretP:"Ușa se deschide doar dacă te lasă mirii. Codul are legătură cu cuplul.",codeLbl:"Cod din 4 cifre",enter:"Intră",wrong:"Cod greșit. Încearcă din nou sau sună-l pe mire.",
  waBtn:"Sună-l pe mire pe WhatsApp",waText:"Am găsit moara secretă! Care e codul?",denH:"Felicitări! Ai găsit clădirea secretă",denP:"Aici sunt doar prietenii noștri cei mai buni. Canapele, jocuri, povești. Aici putem fi noi înșine.",denSpot:"Canapeaua",denGuide:"Stai pe canapea cu gașca.",
  teleport:"Teleportare",simpleStops:"Toate opririle",simpleNote:"Atinge „Teleportare” ca să ajungi direct în clădire.",nextGo:"→",
  pie:{kiss:"Pupic",kisslong:"Îmbrățișare & sărut",dance:"Dans",chat:"Poveste",selfie:"Selfie",wave:"Salută",sit:"Stai jos"},moods:{fun:"Distracție",love:"Iubire",party:"Petrecere"},
  selfieH:"Fotografia voastră",save:"Salvează",share:"Trimite",clubTracks:"Alege o melodie",credits:"Muzica din club: Kevin MacLeod (incompetech.com), CC BY 4.0"}};
for(const l in MORE2){Object.assign(T[l],MORE2[l]);T[l].guide.den=T[l].denGuide;T[l].spot.den=T[l].denSpot}
Object.assign(T.el,{plaza:"Η πλατεία",plazaSub:"Το σημείο συνάντησης · κάτσε σε ένα παγκάκι"});
Object.assign(T.en,{plaza:"The plaza",plazaSub:"The meeting point · sit on a bench"});
Object.assign(T.de,{plaza:"Der Platz",plazaSub:"Der Treffpunkt · setz dich auf eine Bank"});
Object.assign(T.ro,{plaza:"Piața",plazaSub:"Locul de întâlnire · stai pe o bancă"});
Object.assign(T.el,{inviteEyebrow:"Σας προσκαλούμε στον γάμο μας",sealHint:"Πάτα τη σφραγίδα για να ανοίξει",tabCal:"Ημερολόγιο",tabRsvp:"Θα έρθεις;"});
Object.assign(T.en,{inviteEyebrow:"You are invited to our wedding",sealHint:"Tap the seal to open",tabCal:"Calendar",tabRsvp:"Will you come?"});
Object.assign(T.de,{inviteEyebrow:"Wir laden euch zu unserer Hochzeit ein",sealHint:"Tippe auf das Siegel zum Öffnen",tabCal:"Kalender",tabRsvp:"Kommst du?"});
Object.assign(T.ro,{inviteEyebrow:"Vă invităm la nunta noastră",sealHint:"Atinge sigiliul ca să deschizi",tabCal:"Calendar",tabRsvp:"Vii?"});
/* dog, vespa riding, finale, selfie with the camera */
const MORE3={
el:{dogName:"Το σκυλάκι μας",dpie:{pet:"Χάιδεψέ το",dead:"Κάνε τον ψόφιο",bark:"Γάβγισε",sit:"Κάτσε"},vpie:{ride:"Ανέβα στη Vespa"},getOff:"Κατέβα",
  finaleH:"Τίποτα δεν τελείωσε ακόμα",finaleP:"Τα έκανες όλα. Τώρα ξεκινάει το παιχνίδι: τα λέμε στις 20 Αυγούστου 2027!",finaleBtn:"Πάμε!",
  camOn:"Βγες κι εσύ στη φωτογραφία",camShot:"Τράβα",camNo:"Η κάμερα δεν άνοιξε. Η φωτογραφία βγαίνει μόνο με το ζευγάρι.",danceHint:"Χορέψτε! Για μουσική πήγαινε στον DJ.",
  driveHint:"Οδήγησε με το joystick ή πάτα κάπου στον δρόμο."},
en:{dogName:"Our little dog",dpie:{pet:"Pet",dead:"Play dead",bark:"Bark",sit:"Sit"},vpie:{ride:"Ride the Vespa"},getOff:"Get off",
  finaleH:"Nothing is over yet",finaleP:"You did it all. Now the game begins: see you on 20 August 2027!",finaleBtn:"Let's go!",
  camOn:"Get in the photo too",camShot:"Snap",camNo:"The camera didn't open. The photo shows just the couple.",danceHint:"Dance! For music, go to the DJ.",
  driveHint:"Drive with the joystick or tap somewhere on the road."},
de:{dogName:"Unser Hündchen",dpie:{pet:"Streicheln",dead:"Toter Hund",bark:"Bellen",sit:"Sitz"},vpie:{ride:"Auf die Vespa"},getOff:"Absteigen",
  finaleH:"Nichts ist vorbei",finaleP:"Du hast alles geschafft. Jetzt beginnt das Spiel: wir sehen uns am 20. August 2027!",finaleBtn:"Los!",
  camOn:"Komm mit aufs Foto",camShot:"Auslösen",camNo:"Die Kamera ging nicht an. Das Foto zeigt nur das Paar.",danceHint:"Tanzt! Für Musik geh zum DJ.",
  driveHint:"Fahr mit dem Joystick oder tippe auf die Straße."},
ro:{dogName:"Cățelușul nostru",dpie:{pet:"Mângâie-l",dead:"Fă-te mort",bark:"Latră",sit:"Șezi"},vpie:{ride:"Urcă pe Vespa"},getOff:"Coboară",
  finaleH:"Nimic nu s-a terminat",finaleP:"Le-ai făcut pe toate. Acum începe jocul: ne vedem pe 20 august 2027!",finaleBtn:"Hai!",
  camOn:"Intră și tu în poză",camShot:"Fă poza",camNo:"Camera nu s-a deschis. Poza îi arată doar pe miri.",danceHint:"Dansați! Pentru muzică mergi la DJ.",
  driveHint:"Condu cu joystick-ul sau atinge drumul."}};
for(const l in MORE3)Object.assign(T[l],MORE3[l]);
Object.assign(T.el,{backPlaza:"Πίσω στην πλατεία",tasksOf:"αποστολές",lock6:"Ξεκλειδώνει με 5/5",pickG:"Ευάγγελος · με τα πόδια",pickB:"Κωνσταντίνα · με τη Vespa",shout:"ΕΙΣΑΙ ΝΟΟΟΟΒ!"});
Object.assign(T.en,{backPlaza:"Back to the plaza",tasksOf:"tasks",lock6:"Unlocks at 5/5",pickG:"Evangelos · on foot",pickB:"Konstantina · on the Vespa",shout:"YOU'RE A NOOOOB!"});
Object.assign(T.de,{backPlaza:"Zurück zum Platz",tasksOf:"Aufgaben",lock6:"Öffnet bei 5/5",pickG:"Evangelos · zu Fuß",pickB:"Konstantina · mit der Vespa",shout:"DU NOOOOB!"});
Object.assign(T.ro,{backPlaza:"Înapoi în piață",tasksOf:"misiuni",lock6:"Se deblochează la 5/5",pickG:"Evangelos · pe jos",pickB:"Konstantina · cu Vespa",shout:"EȘTI NOOOOB!"});
for(const l in T){T[l].pie.shout=T[l].shout}
/* the end-of-game quiz: 5 questions only close friends would know (PLACEHOLDERS: the couple will replace them).
   Each entry: [question, [answers…], index of the right answer]. The hint appears once all five are right. */
const QZ={
el:{qzW:"Πλατεία",qzH:"Συγχαρητήρια!",qzP:"Κάνατε όλα τα quest. Τα παιδιά σας έχουν μια έκπληξη, αν απαντήσετε σωστά σε 5 ερωτήσεις που μόνο εσείς θα ξέρετε.",qzOk:"Σωστό!",qzNo:"Όχι… ξαναπροσπάθησε",qzOf:"σωστές",
  qzWinH:"Μπράβο!",qzWin:"Αν νιώθεις οικογένειά μας, έλα να μας βρεις στο επόμενο κρυφό δωμάτιο. Θέλει ψάξιμο: ο τελευταίος ανεμόμυλος δεν γυρίζει σαν τους άλλους. Ακολούθησε τις πατουσίτσες. Ο κωδικός κρύβεται σε μια φωτογραφία της γκαλερί. Δεν τον βρίσκεις; Ρώτα μας στο WhatsApp.",qzGo:"Πάμε",
  qz:[["Ποιος είναι αριστερόχειρας;",["Ο γαμπρός","Η νύφη","Και οι δύο","Κανείς"],0],["Ποιος νυστάζει από τις 23:00, ακόμα κι αν είναι έξω, και θέλει τουλάχιστον 10 ώρες ύπνο;",["Ο γαμπρός","Η νύφη","Και οι δύο"],1],["Σε ποια πόλη ξεκίνησε η ιστορία μας;",["Πάτρα","Θήβα","Βόλος"],1],["Τι ράτσα είναι το σκυλάκι μας;",["Μαλτέζ","Πούντλ","Τσιουάουα"],0],["Σε ποια χώρα ζήσαμε μαζί;",["Ιταλία","Αγγλία","Γερμανία"],2]]},
en:{qzW:"Plaza",qzH:"Congratulations!",qzP:"You finished every quest. The couple has a surprise for you if you get 5 questions right that only you would know.",qzOk:"Right!",qzNo:"No… try again",qzOf:"right",
  qzWinH:"Well done!",qzWin:"If you feel like family to us, come and find us in the next hidden room. It takes some searching: the last windmill doesn't turn like the others. Follow the pawprints. The code is hidden in a photo in the gallery. Can't find it? Ask us on WhatsApp.",qzGo:"Let's go",
  qz:[["Who is left-handed?",["The groom","The bride","Both","Neither"],0],["Who gets sleepy from 23:00, even when out, and needs at least 10 hours of sleep?",["The groom","The bride","Both"],1],["In which town did our story begin?",["Patras","Thebes","Volos"],1],["What breed is our little dog?",["Maltese","Poodle","Chihuahua"],0],["Which country did we live in together?",["Italy","England","Germany"],2]]},
de:{qzW:"Platz",qzH:"Glückwunsch!",qzP:"Du hast alle Quests geschafft. Das Paar hat eine Überraschung, wenn du 5 Fragen richtig beantwortest, die nur du weißt.",qzOk:"Richtig!",qzNo:"Nein… nochmal",qzOf:"richtig",
  qzWinH:"Bravo!",qzWin:"Die letzte Windmühle dreht sich nicht wie die anderen. Folge den Pfötchen und such die Tür mit dem Hund.",qzGo:"Los",
  qz:[["Wer ist Linkshänder?",["Der Bräutigam","Die Braut","Beide","Keiner"],0],["Wer wird ab 23:00 müde, auch unterwegs, und braucht mindestens 10 Stunden Schlaf?",["Der Bräutigam","Die Braut","Beide"],1],["In welcher Stadt begann unsere Geschichte?",["Patras","Theben","Volos"],1],["Welche Rasse ist unser Hündchen?",["Malteser","Pudel","Chihuahua"],0],["In welchem Land haben wir zusammen gelebt?",["Italien","England","Deutschland"],2]]},
ro:{qzW:"Piață",qzH:"Felicitări!",qzP:"Ai terminat toate misiunile. Mirii au o surpriză dacă răspunzi corect la 5 întrebări pe care doar tu le știi.",qzOk:"Corect!",qzNo:"Nu… mai încearcă",qzOf:"corecte",
  qzWinH:"Bravo!",qzWin:"Ultima moară de vânt nu se învârte ca celelalte. Urmează lăbuțele și caută ușa cu cățelul.",qzGo:"Hai",
  qz:[["Cine e stângaci?",["Mirele","Mireasa","Amândoi","Niciunul"],0],["Cui i se face somn de la 23:00, chiar și în oraș, și are nevoie de minim 10 ore de somn?",["Mirelui","Miresei","Amândurora"],1],["În ce oraș a început povestea noastră?",["Patra","Teba","Volos"],1],["Ce rasă e cățelușul nostru?",["Maltez","Pudel","Chihuahua"],0],["În ce țară am locuit împreună?",["Italia","Anglia","Germania"],2]]}};
for(const l in QZ)Object.assign(T[l],QZ[l]);
/* gifts, info, VIP ideas, saved answers */
const MORE4={
el:{giftL:"Δώρο",giftH:"Θέλετε να μας κάνετε δώρο;",giftP:"Η παρουσία σας είναι το μεγαλύτερο δώρο. Αν θέλετε, μπορείτε και έτσι:",holder:"Δικαιούχος",copy:"Αντιγραφή",copied:"Αντιγράφηκε!",openRev:"Άνοιγμα Revolut",irisP:"Πληρωμή με IRIS στο κινητό",
  infoH:"Χρήσιμες πληροφορίες",yourAns:"Η απάντησή σου",attY:"Έρχομαι",attN:"Δεν μπορώ",persons:"άτομα",change:"Αλλαγή",
  vipH:"Μόνο για τους δικούς μας",vipIdeaH:"Τι θέλετε να κάνουμε μετά τον γάμο;",vipIdeaP:"Πείτε μας ιδέες, προτάσεις ή ό,τι θέλετε να μας πείτε.",vipSent:"Το λάβαμε, ευχαριστούμε!"},
en:{giftL:"Gift",giftH:"Would you like to give us a gift?",giftP:"Your presence is the greatest gift. If you wish, you can also:",holder:"Account holder",copy:"Copy",copied:"Copied!",openRev:"Open Revolut",irisP:"Pay with IRIS on your phone",
  infoH:"Good to know",yourAns:"Your answer",attY:"Coming",attN:"Can't come",persons:"people",change:"Change",
  vipH:"Only for our people",vipIdeaH:"What should we do after the wedding?",vipIdeaP:"Tell us ideas, suggestions or anything you want to say to us.",vipSent:"Got it, thank you!"}};
for(const l in MORE4)Object.assign(T[l],MORE4[l]);
/* DE/RO: anything not translated yet falls back to English */
for(const l of ["de","ro"])for(const k in T.en)if(!(k in T[l]))T[l][k]=T.en[k];
const MORE5={
el:{albumL:"Άλμπουμ γάμου",albumH:"Το άλμπουμ του γάμου μας",albumP:"Βγάλατε φωτογραφίες; Ανεβάστε τες εδώ, όλοι μαζί σε ένα άλμπουμ. Θέλουμε να ζήσουμε ξανά τη μέρα μας και μέσα από τα δικά σας μάτια. Κάθε στιγμή που θα μοιραστείτε είναι για εμάς ένα δώρο.",albumBtn:"Άνοιγμα άλμπουμ",
  honeyPick:"Διάλεξε ήπειρο. Σε Ευρώπη, Ασία και Αφρική έχουμε ήδη πάει!",
  drinksH:"Τι να πίνουμε στον γάμο;",drinksP:"Διάλεξε τα ποτά που θέλεις να υπάρχουν στο μπαρ. Μπορείς πολλά.",drinksSent:"Σημειώθηκε, στην υγειά μας!",
  dr:{aperol:"Aperol Spritz",gin:"Gin Tonic",mojito:"Mojito",whisky:"Ουίσκι",wine:"Κρασί",beer:"Μπίρα"},menuL:"Μενού",menuH:"Τι θα φάμε",info:"Πληροφορίες"},
en:{albumL:"Wedding album",albumH:"Our wedding album",albumP:"Took photos? Upload them here, all together in one album. We want to live our day again through your eyes. Every moment you share is a gift to us.",albumBtn:"Open the album",
  honeyPick:"Pick a continent. We've already been to Europe, Asia and Africa!",
  drinksH:"What should we drink at the wedding?",drinksP:"Pick the drinks you want at the bar. You can pick several.",drinksSent:"Noted, cheers!",
  dr:{aperol:"Aperol Spritz",gin:"Gin Tonic",mojito:"Mojito",whisky:"Whisky",wine:"Wine",beer:"Beer"},menuL:"Menu",menuH:"What we'll eat",info:"Info"}};
for(const l in MORE5)Object.assign(T[l],MORE5[l]);
for(const l of ["de","ro"])for(const k in T.en)if(!(k in T[l]))T[l][k]=T.en[k];
Object.assign(T.el,{passed:"Το πέρασες!",questDone:"Quest ολοκληρώθηκε. Περιηγήσου ελεύθερα.",questToPass:"για να το περάσεις"});
Object.assign(T.en,{passed:"You passed it!",questDone:"Quest done. Look around freely.",questToPass:"to pass the quest"});
Object.assign(T.de,{passed:"Geschafft!",questDone:"Quest erledigt. Schau dich in Ruhe um.",questToPass:"um die Quest zu schaffen"});
Object.assign(T.ro,{passed:"Ai reușit!",questDone:"Misiune încheiată. Explorează liniștit.",questToPass:"ca să treci misiunea"});
Object.assign(T.el,{villaBtn:"Δες τη βίλα στο Booking",tvL:"Fortnite",tabletL:"Η πρόταση",tabletH:"Η πρόταση γάμου",boardH:"Κατάταξη"});
Object.assign(T.en,{villaBtn:"See the villa on Booking",tvL:"Fortnite",tabletL:"The proposal",tabletH:"The proposal",boardH:"Leaderboard"});
for(const l of ["de","ro"])for(const k in T.en)if(!(k in T[l]))T[l][k]=T.en[k];
Object.assign(T.el,{isaiah:"«Ησαΐα χόρευε…» Ελάτε, γύρω-γύρω όλοι μαζί!"});Object.assign(T.en,{isaiah:"“Isaiah, dance…” Come, all around together!"});
Object.assign(T.de,{isaiah:"„Jesaja, tanze…“ Kommt, alle zusammen im Kreis!"});Object.assign(T.ro,{isaiah:"„Isaie, dănțuiește…” Haideți, toți împreună în cerc!"});
Object.assign(T.el,{kidsL:"Αυτά τα παιδιά…",kidsH:"Αυτά τα παιδιά παντρεύονται!!",yearsH:"Ένας χρόνος, μία φωτογραφία",yearsSoon:"Οι φωτογραφίες έρχονται σύντομα."});
Object.assign(T.en,{kidsL:"These kids…",kidsH:"These kids are getting married!!",yearsH:"One year, one photo",yearsSoon:"Photos coming soon."});
for(const l of ["de","ro"])for(const k in T.en)if(!(k in T[l]))T[l][k]=T.en[k];
Object.assign(T.el,{games:{ttt:"Τρίλιζα",snake:"Φιδάκι",maze:"Λαβύρινθος"},arcadeH:"Arcade",arcadeP:"Διάλεξε παιχνίδι. Βάλε όνομα και δες πού είσαι στην κατάταξη.",nameH:"Πώς σε λένε;",username:"Όνομα παίκτη",play:"Παίξε",score:"Σκορ",again:"Ξανά",board:"Κατάταξη",noScores:"Κανένα σκορ ακόμα. Γίνε ο πρώτος!",youWin:"Κέρδισες!",youLose:"Έχασες!",draw:"Ισοπαλία",gameOver:"Τέλος παιχνιδιού"});
Object.assign(T.en,{games:{ttt:"Tic-tac-toe",snake:"Snake",maze:"Maze"},arcadeH:"Arcade",arcadeP:"Pick a game. Enter your name and see where you rank.",nameH:"What's your name?",username:"Player name",play:"Play",score:"Score",again:"Again",board:"Leaderboard",noScores:"No scores yet. Be the first!",youWin:"You win!",youLose:"You lose!",draw:"Draw",gameOver:"Game over"});
for(const l of ["de","ro"])for(const k in T.en)if(!(k in T[l]))T[l][k]=T.en[k];
for(const l in T){T[l].guide.arcade=T[l].arcadeP;T[l].spot.arcade=T[l].arcadeH}
/* the koumbaroi (best man and maid of honour) */
Object.assign(T.el,{koumLine:"Κουμπάροι: Αθανάσιος Παπαχαράλαμπος & Δήμητρα Μπουλάλα",koumW:"Οι κουμπάροι μας",kpTag:"Κουμπάρος · Θάνος",kaTag:"Κουμπάρα · Δήμητρα",
  kpieM:{meet:"Γνώρισέ τον",chat:"Κουβέντα",dance:"Χόρεψε με τον κουμπάρο",wave:"Χαιρέτα"},kpieF:{meet:"Γνώρισέ τη",chat:"Κουβέντα",dance:"Χόρεψε με την κουμπάρα",wave:"Χαιρέτα"},
  kpH:"Ο κουμπάρος μας",kpFull:"Αθανάσιος (Θάνος) Παπαχαράλαμπος",kpP:"Ο Θάνος είναι φίλος μου από το γυμνάσιο. Έχουμε περάσει μαζί πάρα πολλά και ήταν πάντα δίπλα μου, σε όλα. Ήταν εκεί από την πρώτη μέρα που γνώρισα τη Ναντίνα, οπότε δεν θα μπορούσε να είναι κανείς άλλος ο κουμπάρος μας.",kpSig:"Ευάγγελος",
  kaH:"Η κουμπάρα μας",kaFull:"Δήμητρα Μπουλάλα",kaP:"Η Δήμητρα είναι φίλη μου από τα φοιτητικά μου χρόνια, εδώ και περίπου 15 χρόνια. Ήταν από τις πρώτες και πιο βασικές μας παρέες στην Αθήνα και έχουμε ζήσει μαζί πάρα πολλά. Δεν θα μπορούσε να είναι κανείς άλλος η κουμπάρα μας.",kaSig:"Κωνσταντίνα",
  kpSay:"Από το γυμνάσιο μαζί, και τώρα κουμπάρος!",kaSay:"15 χρόνια φιλίας, και τώρα κουμπάρα!",home:"Επιστροφή στην πλατεία"});
Object.assign(T.en,{koumLine:"Koumbaroi: Athanasios Papacharalampos & Dimitra Mpoulala",koumW:"Our koumbaroi",kpTag:"Best man · Thanos",kaTag:"Koumbara · Dimitra",
  kpieM:{meet:"Meet him",chat:"Chat",dance:"Dance with the best man",wave:"Wave"},kpieF:{meet:"Meet her",chat:"Chat",dance:"Dance with the koumbara",wave:"Wave"},
  kpH:"Our best man",kpFull:"Athanasios (Thanos) Papacharalampos",kpP:"Thanos has been my friend since secondary school. We have been through a lot together and he has always been by my side, in everything. He was there from the very first day I met Nadina, so nobody else could be our koumbaros.",kpSig:"Evangelos",
  kaH:"Our koumbara",kaFull:"Dimitra Mpoulala",kaP:"Dimitra has been my friend since my student years, for about 15 years now. She was one of our very first and closest groups of friends in Athens, and we have lived so much together. Nobody else could be our koumbara.",kaSig:"Konstantina",
  kpSay:"Friends since school, and now the best man!",kaSay:"15 years of friendship, and now koumbara!",home:"Back to the square"});
Object.assign(T.de,{koumLine:"Trauzeugen: Athanasios Papacharalampos & Dimitra Mpoulala",koumW:"Unsere Trauzeugen",kpTag:"Trauzeuge · Thanos",kaTag:"Trauzeugin · Dimitra",
  kpieM:{meet:"Lerne ihn kennen",chat:"Plaudern",dance:"Tanz mit dem Trauzeugen",wave:"Winken"},kpieF:{meet:"Lerne sie kennen",chat:"Plaudern",dance:"Tanz mit der Trauzeugin",wave:"Winken"},
  kpH:"Unser Trauzeuge",kpFull:"Athanasios (Thanos) Papacharalampos",kpP:"Thanos ist seit der Schulzeit mein Freund. Wir haben zusammen sehr viel erlebt, und er war immer an meiner Seite, bei allem. Er war vom ersten Tag an dabei, an dem ich Nadina kennengelernt habe – niemand anderes könnte unser Trauzeuge sein.",kpSig:"Evangelos",
  kaH:"Unsere Trauzeugin",kaFull:"Dimitra Mpoulala",kaP:"Dimitra ist seit meiner Studienzeit meine Freundin, seit etwa 15 Jahren. Sie gehörte zu unseren ersten und wichtigsten Freunden in Athen, und wir haben sehr viel zusammen erlebt. Niemand anderes könnte unsere Trauzeugin sein.",kaSig:"Konstantina",
  kpSay:"Seit der Schule befreundet – und jetzt Trauzeuge!",kaSay:"15 Jahre Freundschaft – und jetzt Trauzeugin!",home:"Zurück zum Platz"});
Object.assign(T.ro,{koumLine:"Nași: Athanasios Papacharalampos & Dimitra Mpoulala",koumW:"Nașii noștri",kpTag:"Naș · Thanos",kaTag:"Nașă · Dimitra",
  kpieM:{meet:"Cunoaște-l",chat:"Poveste",dance:"Dansează cu nașul",wave:"Salută"},kpieF:{meet:"Cunoaște-o",chat:"Poveste",dance:"Dansează cu nașa",wave:"Salută"},
  kpH:"Nașul nostru",kpFull:"Athanasios (Thanos) Papacharalampos",kpP:"Thanos este prietenul meu din gimnaziu. Am trecut împreună prin foarte multe și a fost mereu alături de mine, în toate. A fost acolo din prima zi în care am cunoscut-o pe Nadina, așa că nimeni altcineva nu putea fi nașul nostru.",kpSig:"Evangelos",
  kaH:"Nașa noastră",kaFull:"Dimitra Mpoulala",kaP:"Dimitra este prietena mea din anii de studenție, de aproape 15 ani. A fost unul dintre primii și cei mai apropiați prieteni ai noștri din Atena și am trăit împreună foarte multe. Nimeni altcineva nu putea fi nașa noastră.",kaSig:"Konstantina",
  kpSay:"Prieteni din școală, iar acum naș!",kaSay:"15 ani de prietenie, iar acum nașă!",home:"Înapoi în piață"});
Object.assign(T.el,{voteName:"Ονοματεπώνυμο",voteOnce:"Μπορείς να ψηφίσεις μόνο μία φορά και δεν αλλάζει μετά. Σκέψου καλά πριν πατήσεις!"});
Object.assign(T.en,{voteName:"Full name",voteOnce:"You can vote only once and it can't be changed. Think before you tap!"});
Object.assign(T.de,{voteName:"Vor- und Nachname",voteOnce:"Du kannst nur einmal abstimmen, danach lässt es sich nicht ändern. Überleg gut!"});
Object.assign(T.ro,{voteName:"Nume și prenume",voteOnce:"Poți vota o singură dată și nu se mai poate schimba. Gândește-te bine!"});
Object.assign(T.el,{qzOnce:"Προσοχή: έχεις μόνο μία ευκαιρία. Αν απαντήσεις λάθος, το τεστ τελειώνει και δεν ξαναγίνεται.",qzFail:"Κρίμα, ήταν λάθος! Το τεστ τελείωσε. Ρώτα μας από κοντά για την έκπληξη 😉"});
Object.assign(T.en,{qzOnce:"Careful: you get one chance. One wrong answer ends the test for good.",qzFail:"Oops, that was wrong! The test is over. Ask us in person about the surprise 😉"});
Object.assign(T.de,{qzOnce:"Achtung: nur ein Versuch. Eine falsche Antwort beendet den Test endgültig.",qzFail:"Schade, das war falsch! Der Test ist vorbei. Frag uns persönlich nach der Überraschung 😉"});
Object.assign(T.ro,{qzOnce:"Atenție: ai o singură șansă. Un răspuns greșit încheie testul definitiv.",qzFail:"Păcat, a fost greșit! Testul s-a încheiat. Întreabă-ne personal despre surpriză 😉"});
/* the hidden-room hint, the koumbaroi in their own words */
Object.assign(T.el,{qzWin:"Αν νιώθεις οικογένεια, έλα να μας βρεις στο κρυφό δωμάτιο. Θέλει ψάξιμο: οι ανεμόμυλοι δεν είναι όλοι ίδιοι, ακολούθησε τις πατημασιές του Boogie. Ο κωδικός είναι κρυμμένος στο παιχνίδι. Δεν τον βρίσκεις; Ρώτα το ζευγάρι.",
  kpP:"Ο Θάνος είναι φίλος μου από το γυμνάσιο. Μεγαλώσαμε μαζί, από τα θρανία και τα πρώτα μας ξενύχτια μέχρι τις μεγάλες αποφάσεις της ζωής μας. Σε κάθε χαρά ήταν ο πρώτος που πανηγύρισε μαζί μου, και σε κάθε δύσκολη στιγμή ήταν εκεί πριν καν του το ζητήσω. Ήταν δίπλα μου από την πρώτη μέρα που γνώρισα τη Ναντίνα και είδε αυτή την ιστορία να γεννιέται. Θάνο, σε ευχαριστώ που είσαι ο αδερφός που διάλεξα. Δεν θα μπορούσε να είναι κανείς άλλος ο κουμπάρος μας.",kpSig:"Ευάγγελος",
  kaP:"Η Δήμητρα είναι η φίλη μου από τα φοιτητικά μου χρόνια, εδώ και 15 χρόνια. Μαζί ζήσαμε τα πρώτα βήματα στην Αθήνα, γέλια μέχρι το πρωί και κουβέντες για όλα όσα μας απασχολούσαν. Ήταν από τις πρώτες και πιο βασικές μας παρέες και έχει σταθεί δίπλα μου σε κάθε κεφάλαιο της ζωής μου. Δήμητρα μου, σε ευχαριστώ για κάθε αγκαλιά, κάθε συμβουλή και κάθε φορά που με έκανες να νιώσω ότι δεν είμαι ποτέ μόνη. Δεν θα μπορούσε να είναι καμία άλλη η κουμπάρα μας.",kaSig:"Ναντίνα"});
Object.assign(T.en,{qzWin:"If you feel like family, come and find us in the hidden room. It takes some searching: the windmills are not all the same, follow Boogie's paw prints. The code is hidden in the game. Can't find it? Ask the couple.",
  kpP:"Thanos has been my friend since secondary school. We grew up together, from school desks and our first late nights to the biggest decisions of our lives. In every joy he was the first to celebrate with me, and in every hard moment he was there before I even asked. He was by my side from the very first day I met Nadina and watched this story begin. Thanos, thank you for being the brother I chose. Nobody else could be our koumbaros.",kpSig:"Evangelos",
  kaP:"Dimitra has been my friend since my student years, for 15 years now. Together we lived our first steps in Athens, laughter until morning and talks about everything on our minds. She was one of our very first and closest friends, and she has stood by me in every chapter of my life. Dimitra, thank you for every hug, every piece of advice and every time you made me feel I am never alone. Nobody else could be our koumbara.",kaSig:"Nadina"});
Object.assign(T.de,{qzWin:"Wenn du dich wie Familie fühlst, finde uns im geheimen Raum. Es braucht etwas Suchen: Die Windmühlen sind nicht alle gleich, folge Boogies Pfotenabdrücken. Der Code ist im Spiel versteckt. Du findest ihn nicht? Frag das Brautpaar.",
  kpP:"Thanos ist seit der Schulzeit mein Freund. Wir sind zusammen groß geworden, von der Schulbank und den ersten durchgemachten Nächten bis zu den großen Entscheidungen unseres Lebens. Bei jeder Freude hat er als Erster mit mir gefeiert, und in jedem schweren Moment war er da, bevor ich überhaupt fragen musste. Er war vom ersten Tag an dabei, an dem ich Nadina kennengelernt habe, und hat diese Geschichte entstehen sehen. Thanos, danke, dass du der Bruder bist, den ich mir ausgesucht habe. Niemand anderes könnte unser Trauzeuge sein.",kpSig:"Evangelos",
  kaP:"Dimitra ist seit meiner Studienzeit meine Freundin, seit 15 Jahren. Zusammen haben wir die ersten Schritte in Athen erlebt, Lachen bis zum Morgen und Gespräche über alles, was uns bewegt hat. Sie gehörte zu unseren ersten und engsten Freunden und stand mir in jedem Kapitel meines Lebens zur Seite. Liebe Dimitra, danke für jede Umarmung, jeden Rat und jedes Mal, wenn du mir gezeigt hast, dass ich nie allein bin. Niemand anderes könnte unsere Trauzeugin sein.",kaSig:"Nadina"});
Object.assign(T.ro,{qzWin:"Dacă te simți ca în familie, vino să ne găsești în camera secretă. E nevoie de căutare: morile de vânt nu sunt toate la fel, urmează urmele lăbuțelor lui Boogie. Codul e ascuns în joc. Nu-l găsești? Întreabă mirii.",
  kpP:"Thanos este prietenul meu din gimnaziu. Am crescut împreună, de la băncile școlii și primele nopți pierdute până la cele mai mari decizii ale vieții noastre. La fiecare bucurie a fost primul care a sărbătorit cu mine, iar în fiecare moment greu a fost acolo înainte să-i cer. A fost alături de mine din prima zi în care am cunoscut-o pe Nadina și a văzut cum se naște această poveste. Thanos, îți mulțumesc că ești fratele pe care l-am ales. Nimeni altcineva nu putea fi nașul nostru.",kpSig:"Evangelos",
  kaP:"Dimitra este prietena mea din anii de studenție, de 15 ani. Împreună am trăit primii pași în Atena, râsete până dimineața și discuții despre tot ce ne frământa. A fost printre primii și cei mai apropiați prieteni ai noștri și a fost alături de mine în fiecare capitol al vieții mele. Dimitra mea, îți mulțumesc pentru fiecare îmbrățișare, fiecare sfat și fiecare dată când m-ai făcut să simt că nu sunt niciodată singură. Nimeni altcineva nu putea fi nașa noastră.",kaSig:"Nadina"});
Object.assign(T.el,{nameH:"Πώς σε λένε;",nameP:"Γράψε το ονοματεπώνυμό σου όπως θέλεις να το δούμε στη λίστα μας. Είναι σημαντικό: θα μπει αυτόματα σε όλο το παιχνίδι (RSVP, ψήφος, ποτά, ευχές). Αν παίξεις ξανά από άλλο κινητό, γράψ' το ακριβώς το ίδιο.",nameBtn:"Συνέχεια",votedAlready:"Έχεις ήδη ψηφίσει"});
Object.assign(T.en,{nameH:"What's your name?",nameP:"Write your full name the way you want it on our list. It matters: it fills in everywhere in the game (RSVP, vote, drinks, wishes). If you play again on another phone, write it exactly the same.",nameBtn:"Continue",votedAlready:"You already voted"});
Object.assign(T.de,{nameH:"Wie heißt du?",nameP:"Schreib deinen vollständigen Namen so, wie er auf unserer Liste stehen soll. Er wird überall im Spiel verwendet (Zusage, Abstimmung, Getränke, Wünsche). Spielst du auf einem anderen Handy, schreib ihn genau gleich.",nameBtn:"Weiter",votedAlready:"Du hast schon abgestimmt"});
Object.assign(T.ro,{nameH:"Cum te numești?",nameP:"Scrie-ți numele complet așa cum vrei să apară pe lista noastră. Contează: se completează peste tot în joc (confirmare, vot, băuturi, urări). Dacă joci din nou pe alt telefon, scrie-l exact la fel.",nameBtn:"Continuă",votedAlready:"Ai votat deja"});
/* German and Romanian for everything that was still falling back to English */
Object.assign(T.de,{clubName:"Beachclub",teleport:"Hinbeamen",giftH:"Möchtet ihr uns etwas schenken?",giftP:"Eure Anwesenheit ist das größte Geschenk. Wenn ihr möchtet, geht auch:",holder:"Kontoinhaber",copied:"Kopiert!",openRev:"Revolut öffnen",irisP:"Mit IRIS auf dem Handy bezahlen",
  infoH:"Gut zu wissen",yourAns:"Deine Antwort",attY:"Ich komme",attN:"Ich kann nicht",persons:"Personen",change:"Ändern",vipH:"Nur für unsere Leute",vipIdeaH:"Was sollen wir nach der Hochzeit machen?",vipIdeaP:"Schreib uns Ideen, Vorschläge oder alles, was du uns sagen möchtest.",vipSent:"Angekommen, danke!",
  albumL:"Hochzeitsalbum",albumH:"Unser Hochzeitsalbum",albumP:"Ihr habt Fotos gemacht? Ladet sie hier hoch, alle zusammen in einem Album. Wir wollen unseren Tag durch eure Augen noch einmal erleben. Jeder Moment, den ihr teilt, ist ein Geschenk für uns.",albumBtn:"Album öffnen",
  honeyPick:"Wähle einen Kontinent. In Europa, Asien und Afrika waren wir schon!",drinksH:"Was trinken wir auf der Hochzeit?",drinksP:"Wähle die Getränke, die es an der Bar geben soll. Mehrere sind möglich.",drinksSent:"Notiert, Prost!",
  menuH:"Was wir essen",villaBtn:"Die Villa auf Booking ansehen",tabletL:"Der Antrag",tabletH:"Der Heiratsantrag",boardH:"Rangliste",kidsL:"Diese Kinder…",kidsH:"Diese Kinder heiraten!!",yearsH:"Ein Jahr, ein Foto",yearsSoon:"Fotos folgen bald.",
  arcadeP:"Wähle ein Spiel. Gib deinen Namen ein und sieh, auf welchem Platz du landest.",username:"Spielername",board:"Rangliste",noScores:"Noch keine Punkte. Sei der Erste!",youLose:"Verloren!",gameOver:"Spiel vorbei",
  kpFull:"Athanasios (Thanos) Papacharalampos",kaFull:"Dimitra Mpoulala"});
T.de.guide.arcade=T.de.arcadeP;
Object.assign(T.ro,{clubName:"Beach club",giftH:"Vreți să ne faceți un cadou?",giftP:"Prezența voastră este cel mai mare cadou. Dacă vreți, puteți și:",holder:"Titularul contului",copied:"Copiat!",openRev:"Deschide Revolut",irisP:"Plătește cu IRIS de pe telefon",
  infoH:"Bine de știut",yourAns:"Răspunsul tău",attY:"Vin",attN:"Nu pot veni",persons:"persoane",change:"Schimbă",vipH:"Doar pentru ai noștri",vipIdeaH:"Ce să facem după nuntă?",vipIdeaP:"Scrie-ne idei, sugestii sau orice vrei să ne spui.",vipSent:"Am primit, mulțumim!",
  albumL:"Albumul nunții",albumH:"Albumul nostru de nuntă",albumP:"Ați făcut poze? Încărcați-le aici, toate împreună într-un singur album. Vrem să ne retrăim ziua prin ochii voștri. Fiecare moment pe care îl împărtășiți este un cadou pentru noi.",albumBtn:"Deschide albumul",
  honeyPick:"Alege un continent. În Europa, Asia și Africa am fost deja!",drinksH:"Ce bem la nuntă?",drinksP:"Alege băuturile pe care le vrei la bar. Poți alege mai multe.",drinksSent:"Notat, noroc!",
  menuH:"Ce vom mânca",villaBtn:"Vezi vila pe Booking",tabletL:"Cererea",tabletH:"Cererea în căsătorie",boardH:"Clasament",kidsL:"Copiii aceștia…",kidsH:"Copiii aceștia se căsătoresc!!",yearsH:"Un an, o fotografie",yearsSoon:"Fotografiile vin în curând.",
  arcadeP:"Alege un joc. Scrie-ți numele și vezi pe ce loc ești.",username:"Numele jucătorului",board:"Clasament",noScores:"Încă niciun scor. Fii primul!",youLose:"Ai pierdut!",gameOver:"Joc terminat",
  tabCal:"Calendar",kpFull:"Athanasios (Thanos) Papacharalampos",kaFull:"Dimitra Mpoulala"});
T.ro.guide.arcade=T.ro.arcadeP;T.ro.opt.oceania="Oceania";T.ro.opt.antarctica="Antarctica";
