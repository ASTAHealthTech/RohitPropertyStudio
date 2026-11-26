"""Writes scripts/report/research/<slug>.json for the projects on sale.

Corridor facts (metro, roads, jobs, asking-price series) are researched once per
area and shared; each carries its source and the date it was read. Per-project
lines (headline, pitch) are written by hand below. Sobha Parq City has its own
hand-written file and is not touched here. Re-run after updating a corridor.
"""
import json, os
OUT = os.path.join(os.path.dirname(__file__), "research")
CHECKED = "26 November 2026"
SY = "Square Yards property rates page, read 26 Nov 2026. Asking prices from listings, not registered sale prices."
SYS = "Square Yards, Nov 2026"
WK = "Wikipedia (Namma Metro line pages), read 26 Nov 2026"

BLUE = {"title": "The airport metro is in trial runs", "text": "Trial runs on the Blue Line began in November 2026. Its 38.44 km airport stretch runs from KR Puram through Hebbal and Yelahanka to the airport.", "source": "IANS, 11 Nov 2026"}
AERO = {"title": "Jobs are moving north", "text": "The KIADB Aerospace Park covers nearly 950 acres of aerospace manufacturing and testing next to the airport.", "source": "The Realty Today, 2026"}
PRR = {"title": "A new ring road is planned", "text": "The Bengaluru Business Corridor (Peripheral Ring Road) is a 73 km road with a reported 2029 deadline, linking the Devanahalli side with the Sarjapur side.", "source": "Sattva Group market note, 2026"}
UP_BLUE = {"what": "Airport metro (Blue Line, Phase 2B)", "status": "Trial runs began November 2026. 38.44 km from KR Puram to the airport via Hebbal and Yelahanka. Overall construction was 72% in August 2026; completion is reported for December 2027.", "why": "A metro within reach turns a car-only address into a commuter address.", "source": "IANS, 11 Nov 2026; Business Today, 6 Aug 2026; Oneindia, 2026"}
UP_PRR = {"what": "Bengaluru Business Corridor (Peripheral Ring Road)", "status": "73 km ring road with a reported 2029 deadline.", "why": "Takes through-traffic off the Outer Ring Road and shortens cross-city trips.", "source": "Sattva Group market note, 2026"}
UP_AERO = {"what": "KIADB Aerospace Park", "status": "Operating, nearly 950 acres beside the airport.", "why": "New factories and offices bring tenants and buyers who want to live close by.", "source": "The Realty Today, 2026"}
UP_AIRPORT = {"what": "Airport growth", "status": "Kempegowda International Airport keeps adding capacity, with an Airport City business district around it.", "why": "Market reports name airport expansion as the main engine of housing demand in North Bengaluru.", "source": "NoBroker infrastructure guide, 2026; Square Yards, 2026"}
UP_RED = {"what": "Red Line metro (Hebbal to Sarjapura)", "status": "Proposed 37 km line with 28 stations. Karnataka Cabinet approved it in December 2024; central approval was awaited. The revised project report targets April 2033.", "why": "It would give Sarjapur Road its own metro line through Koramangala to Hebbal. Treat the date as a target, not a promise.", "source": WK}
UP_ORANGE = {"what": "Orange Line metro (Kempapura to JP Nagar 4th Phase)", "status": "32.15 km, 22 stations. Approved by the Union Cabinet in August 2024; scheduled completion 2031.", "why": "A western ring of metro that links Hebbal, Peenya and JP Nagar without going through the centre.", "source": WK}
UP_PINK = {"what": "Pink Line metro (Kalena Agrahara to Nagawara)", "status": "21.25 km, 18 stations. The elevated Kalena Agrahara to S.G. Palya section opened on 14 November 2026. The underground section to Nagawara is expected around March to May 2027.", "why": "Connects the Bannerghatta Road side to MG Road and on to Nagawara, where it meets the airport line.", "source": WK}
UP_YELLOW = {"what": "Yellow Line metro (RV Road to Bommasandra)", "status": "Open since 11 August 2025. 19.15 km, 16 stations, running beside Hosur Road through Electronic City.", "why": "Electronic City now has a working metro to the city, which supports both rents and resale.", "source": WK}
UP_PURPLE = {"what": "Purple Line metro (Whitefield to Challaghatta)", "status": "Open. 43.49 km, 37 stations; the Whitefield (Kadugodi) end opened on 26 March 2023.", "why": "Whitefield already has a working metro across the city, and it meets the airport line at KR Pura.", "source": WK}
TL_BLUE = [{"when": "Aug 2026", "what": "Airport metro crosses 72% built"}, {"when": "Nov 2026", "what": "Metro trial runs begin"}, {"when": "Dec 2027", "what": "Metro to airport, reported target"}, {"when": "2029", "what": "Ring road, reported deadline"}]
TLS_BLUE = "Business Today, 6 Aug 2026; IANS, 11 Nov 2026; Oneindia, 2026; Sattva Group market note, 2026. Government target dates can move."
PROG = {"label": "Airport metro (Blue Line) overall construction", "pct": 72, "asOf": "August 2026", "source": "Business Today, 6 Aug 2026"}

def area(name, series, now, **kw):
    return {"name": name, "series": series, "now": now, "source": SY, "short": SYS, **kw}

C = {
 "north_airport": dict(
    reasons=[BLUE, AERO, {"title": "The airport is the neighbour", "text": "Kempegowda International Airport keeps adding capacity and an Airport City business district. Market reports name it as the main engine of housing demand in North Bengaluru.", "source": "NoBroker infrastructure guide, 2026; Square Yards, 2026"}, PRR],
    upcoming=[UP_BLUE, UP_AERO, UP_AIRPORT, UP_PRR], timeline=TL_BLUE, timelineSource=TLS_BLUE, progress=PROG,
    area=area("Devanahalli", [["Dec 2025", 9050], ["Mar 2026", 9250], ["Jun 2026", 9600]], 9600),
    band="The metro is in trial runs, not yet open. Buyers who come in now choose before the line changes how this address is reached.",
    up=["The airport metro opening on schedule", "The Aerospace Park and Airport City adding jobs", "The ring road being delivered", "Few large branded projects close to the airport"],
    down=["Delays to the metro or ring road", "Many projects launching in Devanahalli together", "Long drive to the city centre until the metro runs", "Higher home-loan rates cooling demand"]),
 "north_city": dict(
    reasons=[{"title": "On the airport metro corridor", "text": "Trial runs on the Blue Line began in November 2026. Its station list includes Hebbal, Kodigehalli, Jakkur Cross and Yelahanka on the way to the airport.", "source": "IANS, 11 Nov 2026; Oneindia station list, 2026"}, {"title": "Between the city and the airport", "text": "This stretch of Bellary Road sits between Hebbal and the airport, close to the Manyata office district. Buyers get airport access without leaving the city.", "source": "Location as listed by 100 Yards"}, {"title": "More metro is approved", "text": "The Orange Line (Kempapura to JP Nagar, 32.15 km) was approved by the Union Cabinet in August 2024 and meets the airport line near Hebbal.", "source": WK}, AERO],
    upcoming=[UP_BLUE, UP_ORANGE, UP_AIRPORT, UP_PRR], timeline=TL_BLUE, timelineSource=TLS_BLUE, progress=PROG,
    area=area("Yelahanka", [["Dec 2025", 9750], ["Mar 2026", 10050], ["Jun 2026", 10100]], 10100),
    band="The metro is in trial runs, not yet open. Buyers who come in now choose before the line changes how this address is reached.",
    up=["The airport metro opening on schedule", "Offices at Manyata and along Bellary Road filling up", "The Orange Line moving from approval to construction", "Limited land left for large projects inside the city limits"],
    down=["Delays to the metro", "Peak-hour traffic on Bellary Road and at Hebbal", "Several premium launches competing in the same stretch", "Higher home-loan rates cooling demand"]),
 "sarjapur": dict(
    reasons=[{"title": "A metro line is planned for this road", "text": "The Red Line (Hebbal to Sarjapura, 37 km, 28 stations) was approved by the Karnataka Cabinet in December 2024. The revised project report targets 2033.", "source": WK}, {"title": "Close to the tech corridor", "text": "Sarjapur Road feeds the Outer Ring Road offices. The Blue Line's Silk Board to KR Pura stretch (19.75 km) runs through Bellandur and Marathahalli.", "source": "Business Today, 6 Aug 2026; Square Yards, 2026"}, PRR, {"title": "New launches are holding their price", "text": "Asking prices for new launches on Sarjapur Road rose 3.1% while the wider average stayed flat at about ₹12,250 per sq.ft.", "source": SYS}],
    upcoming=[UP_RED, {"what": "Blue Line metro, Silk Board to KR Pura", "status": "19.75 km along the Outer Ring Road through Bellandur and Marathahalli. Trial runs were expected from late 2026.", "why": "Puts the main office belt that Sarjapur Road residents work in onto the metro.", "source": "Business Today, 6 Aug 2026; Square Yards, 2026"}, UP_PRR],
    timeline=[{"when": "Dec 2024", "what": "Red Line approved by State Cabinet"}, {"when": "Late 2026", "what": "ORR metro trial runs expected"}, {"when": "2029", "what": "Ring road, reported deadline"}, {"when": "2033", "what": "Red Line, project report target"}],
    timelineSource=WK + "; Square Yards, 2026; Sattva Group market note, 2026. Government target dates can move.",
    area=area("Sarjapur Road", [["Dec 2025", 12250], ["Mar 2026", 12200], ["Jun 2026", 12250], ["Sep 2026", 12200]], 12250, **{"yield": 3.92, "rent": 40}),
    band="Sarjapur Road has no metro today. The buyers choosing it now are buying the offices nearby first and the metro plan second.",
    up=["The Red Line getting central approval and starting work", "Outer Ring Road offices staying full", "The ring road being delivered", "Good schools continuing to open on this road"],
    down=["The Red Line slipping beyond its target", "Heavy peak-hour traffic on Sarjapur Road", "A large number of projects launching on the same road", "Higher home-loan rates cooling demand"]),
 "whitefield": dict(
    reasons=[{"title": "The metro is already running", "text": "The Purple Line reaches Whitefield (Kadugodi). The Whitefield end opened on 26 March 2023, and the line runs 43.49 km across the city.", "source": WK}, {"title": "It meets the airport line", "text": "The Purple Line interchanges with the Blue Line at KR Pura. Blue Line trial runs began in November 2026.", "source": "Housing.com metro guide, 2026; IANS, 11 Nov 2026"}, {"title": "One of the city's biggest job hubs", "text": "Whitefield is home to ITPL and a long line of tech parks. Demand here comes from people who work a short drive away.", "source": "Location as listed by 100 Yards"}, PRR],
    upcoming=[UP_PURPLE, UP_BLUE, UP_PRR],
    timeline=[{"when": "Mar 2023", "what": "Metro reaches Whitefield (Kadugodi)"}, {"when": "Nov 2026", "what": "Airport line trial runs begin"}, {"when": "Dec 2027", "what": "Airport line, reported target"}, {"when": "2029", "what": "Ring road, reported deadline"}],
    timelineSource=WK + "; IANS, 11 Nov 2026; Oneindia, 2026; Sattva Group market note, 2026. Government target dates can move.",
    area=area("Whitefield", [["Dec 2025", 14150], ["Mar 2026", 14650], ["Jun 2026", 14500]], 14500, **{"yield": 3.06, "rent": 37}),
    band="Whitefield's metro is running today. That is the difference between a plan and an address that already works.",
    up=["The airport line opening and linking at KR Pura", "Tech parks continuing to hire", "The ring road being delivered", "Limited large land parcels left in Whitefield"],
    down=["Heavy traffic inside Whitefield", "Many projects competing for the same buyers", "Slower hiring in technology", "Higher home-loan rates cooling demand"]),
 "yeshwanthpur": dict(
    reasons=[{"title": "An address that already works", "text": "Yeshwanthpur has a working Green Line metro station and one of the city's main railway terminals. Nothing here depends on a future project.", "source": "Location as listed by 100 Yards"}, {"title": "More metro is approved nearby", "text": "The Orange Line (Kempapura to JP Nagar, 32.15 km, 22 stations) was approved by the Union Cabinet in August 2024 and passes Peenya.", "source": WK}, {"title": "New homes are rare here", "text": "This is a built-up part of the city. Large new projects are few, which is why buyers who want a central western address watch each launch.", "source": "Location as listed by 100 Yards"}],
    upcoming=[UP_ORANGE, UP_PINK, UP_PRR],
    timeline=[{"when": "Aug 2024", "what": "Orange Line approved by Cabinet"}, {"when": "Nov 2026", "what": "Pink Line first section opens"}, {"when": "2029", "what": "Ring road, reported deadline"}, {"when": "2031", "what": "Orange Line, scheduled completion"}],
    timelineSource=WK + "; Sattva Group market note, 2026. Government target dates can move.",
    area=area("Yeshwanthpur", [["Dec 2025", 15100], ["Mar 2026", 11150], ["Jun 2026", 12900], ["Sep 2026", 12200]], 12200, rent=50),
    band="Portal averages in a built-up area swing with the few homes listed each quarter. Judge this project against the new projects around it, not the street average.",
    up=["The Orange Line moving into construction", "Few new projects in a built-up area", "Demand from buyers who want to stay in the west of the city", "Good metro and rail access today"],
    down=["Traffic around Yeshwanthpur and Tumkur Road", "Older resale homes nearby at lower prices", "Delays to the Orange Line", "Higher home-loan rates cooling demand"]),
 "central": dict(
    reasons=[{"title": "The centre of the city", "text": "Mission Road is minutes from MG Road, Richmond Town and the main business district. Land for new homes here almost never comes up.", "source": "Location as listed by 100 Yards"}, {"title": "A metro line is arriving", "text": "The Pink Line's underground section has stations at MG Road and Langford Town and is expected around March to May 2027. Its first section opened on 14 November 2026.", "source": WK}, {"title": "Central prices have been rising", "text": "Asking prices in neighbouring Richmond Town moved from about ₹19,500 to about ₹20,600 per sq.ft. between December 2025 and September 2026.", "source": SYS}],
    upcoming=[UP_PINK, UP_BLUE, UP_ORANGE],
    timeline=[{"when": "Nov 2026", "what": "Pink Line first section opens"}, {"when": "Nov 2026", "what": "Airport line trial runs begin"}, {"when": "2027", "what": "Pink Line underground, expected"}, {"when": "Dec 2027", "what": "Airport line, reported target"}],
    timelineSource=WK + "; IANS, 11 Nov 2026; Oneindia, 2026. Government target dates can move.",
    area=area("Richmond Town (next to Mission Road)", [["Dec 2025", 19500], ["Mar 2026", 19750], ["Jun 2026", 21500], ["Sep 2026", 20600]], 20600, **{"yield": 3.85, "rent": 69}),
    band="A central address does not wait for infrastructure. The Pink Line adds to a location that already has everything.",
    up=["The Pink Line underground section opening", "Almost no new land in the city centre", "Steady demand from business owners and senior professionals", "Strong rents in the central district"],
    down=["A small pool of buyers at this price", "Traffic in the central district", "Delays to the underground metro section", "Higher home-loan rates cooling demand"]),
 "bannerghatta": dict(
    reasons=[{"title": "The metro has just opened here", "text": "The Pink Line's elevated section from Kalena Agrahara to S.G. Palya (7.5 km, 6 stations) opened on 14 November 2026. Kalena Agrahara is on Bannerghatta Road.", "source": WK}, {"title": "It will reach MG Road and Nagawara", "text": "The rest of the Pink Line, underground to Nagawara, is expected around March to May 2027. At Nagawara it meets the airport line.", "source": WK}, {"title": "More metro is approved", "text": "The Orange Line (Kempapura to JP Nagar 4th Phase, 32.15 km) was approved by the Union Cabinet in August 2024.", "source": WK}, {"title": "Prices have moved up this year", "text": "Asking prices on Bannerghatta Road went from about ₹11,950 to about ₹12,450 per sq.ft. between December 2025 and June 2026.", "source": SYS}],
    upcoming=[UP_PINK, UP_ORANGE, UP_PRR],
    timeline=[{"when": "Aug 2024", "what": "Orange Line approved by Cabinet"}, {"when": "Nov 2026", "what": "Pink Line opens to S.G. Palya"}, {"when": "2027", "what": "Pink Line to Nagawara, expected"}, {"when": "2031", "what": "Orange Line, scheduled completion"}],
    timelineSource=WK + ". Government target dates can move.",
    area=area("Bannerghatta Road", [["Dec 2025", 11950], ["Mar 2026", 12850], ["Jun 2026", 12450]], 12450, **{"yield": 3.76, "rent": 39}),
    band="The first Pink Line trains started this month. Bannerghatta Road is no longer waiting for its metro.",
    up=["The Pink Line opening all the way to Nagawara", "The Orange Line moving into construction", "Offices and hospitals along Bannerghatta Road", "Forest-side land being limited"],
    down=["Traffic on Bannerghatta Road at peak hours", "Delays to the underground metro section", "Several large projects in the same stretch", "Higher home-loan rates cooling demand"]),
 "attibele": dict(
    reasons=[{"title": "Electronic City now has a metro", "text": "The Yellow Line (RV Road to Bommasandra, 19.15 km, 16 stations) opened on 11 August 2025 and runs beside Hosur Road.", "source": WK}, {"title": "An entry price few areas still offer", "text": "Attibele asking prices average about ₹6,850 per sq.ft., well below most of Bengaluru.", "source": SYS}, {"title": "Close to a major job hub", "text": "Electronic City and the Bommasandra and Attibele industrial areas are a short drive up Hosur Road.", "source": "Location as listed by 100 Yards"}, PRR],
    upcoming=[UP_YELLOW, UP_PRR, {"what": "Blue Line metro at Silk Board", "status": "The Blue Line starts at Central Silk Board, where it meets the Yellow Line. Trial runs on the Silk Board to KR Pura stretch were expected from late 2026.", "why": "One change of train links the Hosur Road side to the Outer Ring Road offices and, later, the airport.", "source": "Housing.com metro guide, 2026; Square Yards, 2026"}],
    timeline=[{"when": "Aug 2025", "what": "Yellow Line metro opens"}, {"when": "Late 2026", "what": "ORR metro trial runs expected"}, {"when": "Dec 2027", "what": "Airport line, reported target"}, {"when": "2029", "what": "Ring road, reported deadline"}],
    timelineSource=WK + "; Square Yards, 2026; Oneindia, 2026; Sattva Group market note, 2026. Government target dates can move.",
    area=area("Attibele", [["Dec 2025", 6500], ["Mar 2026", 6200], ["Jun 2026", 6350], ["Sep 2026", 6850]], 6850),
    band="The Yellow Line is open. Buyers here are paying an entry price for an area that already has its metro a short drive away.",
    up=["More offices and factories around Electronic City", "The metro being extended further down Hosur Road, if approved", "The ring road being delivered", "Buyers priced out of the city looking south"],
    down=["Distance from the city centre", "The metro ending at Bommasandra, short of Attibele", "Plenty of land, so supply can rise quickly", "Higher home-loan rates cooling demand"]),
}
C["north_thanisandra"] = dict(C["north_city"], area=area("Thanisandra", [["Dec 2025", 10850], ["Mar 2026", 10700], ["Jun 2026", 11200], ["Sep 2026", 11600]], 11600, **{"yield": 4.07, "rent": 38}))
C["north_hebbal"] = dict(C["north_city"], area={"name": "Hebbal", "now": 17100, "source": SY, "short": SYS, "yield": 3.51, "rent": 50},
    upcoming=[UP_BLUE, UP_ORANGE, {"what": "Red Line metro (Hebbal to Sarjapura)", "status": UP_RED["status"], "why": "Hebbal would become a meeting point of three metro lines.", "source": WK}, UP_AIRPORT])
C["kadugodi"] = dict(C["whitefield"], area=area("Kadugodi", [["Dec 2025", 9250], ["Mar 2026", 9600], ["Jun 2026", 10250], ["Sep 2026", 10050]], 10050))
C["north_strr"] = dict(C["north_airport"],
    reasons=[{"title": "Land you own outright", "text": "A plot gives you the land itself, in a gated layout by a known builder, and the freedom to build when you choose.", "source": "Project material, as listed by 100 Yards"}, AERO, {"title": "On the outer ring road", "text": "The site is listed about 300 m from the Satellite Town Ring Road, with Doddaballapura station about 3 km away.", "source": "Distances as listed by 100 Yards"}, PRR],
    band="Plots here are a long-term holding. The airport and the industrial belt are the reasons buyers are looking this far north.", area=None)

P = {
 "assetz-22-crest-yeshwanthpur": ("yeshwanthpur", "New 3 BHK homes in a part of the city where new homes are rare.", "Assetz 22 & Crest sits off West of Chord Road, between Yeshwanthpur and Mahalakshmi Layout. It is a central western address with a working metro and railway terminal close by."),
 "century-immencity-blue-moon-jakkur": ("north_city", "Large 3 BHK homes at Jakkur, on the road to the airport.", "Codename Blue Moon is part of Century's Immencity development at Jakkur, on International Airport Road. It sits between Hebbal and the airport, on the corridor the airport metro will serve."),
 "lodha-beaumont-estate": ("north_airport", "Lodha's first address near the Bengaluru airport.", "Lodha Beaumont Estate is at Sadahalli, off Bellary Road, minutes from the airport. It brings a national luxury builder to the part of Bengaluru that is adding the most infrastructure."),
 "prestige-parklane": ("north_airport", "Prestige homes from ₹65 lakh, inside the Aerospace Park.", "Prestige Parklane is in the KIADB Hi-Tech Defence and Aerospace Park at Devanahalli. It puts a Prestige home next to the jobs and the airport, at an entry price that is hard to find from a top builder."),
 "sattva-thippapura": ("north_strr", "Sattva plots in North Bengaluru, beside the outer ring road.", "Sattva Thippapura is a gated plotted development of more than 24 acres. You choose your plot and build your own home, with a known builder's layout and approvals behind it."),
 "brigade-granada": ("kadugodi", "A 40-acre Brigade township at the Whitefield end of the metro.", "Brigade Granada is on the Whitefield to Kadugodi Road, in East Bengaluru. It is a large township from one of the city's most established builders, close to the Purple Line's last stations."),
 "brigade-wtc-devanahalli": ("north_airport", "Brigade homes in a World Trade Center township near the airport.", "Brigade WTC Devanahalli is in the KIADB Aerospace Park. Homes, offices and shops are planned together, a short drive from the airport."),
 "garden-breeze-prestige-city-sarjapur": ("sarjapur", "A new phase inside The Prestige City, Sarjapur Road.", "Garden Breeze is part of The Prestige City, one of the largest townships on Sarjapur Road. Buyers get a new home inside a township that is already taking shape."),
 "tvs-emerald-cascadia-mission-road": ("central", "Large residences in the centre of Bengaluru.", "TVS Emerald Cascadia is on Mission Road, in the central district. Homes of this size in the middle of the city are rare, and this one comes from the TVS group."),
 "unishire-the-weave-chokkanahalli": ("north_thanisandra", "Ready homes from ₹80 lakh near Jakkur.", "Unishire The Weave is at Chokkanahalli, near Jakkur and Thanisandra. It is ready to move in, so you see the finished home before you pay."),
 "godrej-vanantara-bannerghatta-road": ("bannerghatta", "A 36-acre Godrej community off Bannerghatta Road.", "Godrej Vanantara is at Hommadevanahalli, off Bannerghatta Road in South Bengaluru. It is a large gated community from a national builder, on the side of the city where the Pink Line has just opened."),
 "sumadhura-panorama-devanahalli": ("north_airport", "Sumadhura homes at Devanahalli, close to the airport.", "Sumadhura Panorama is at Devanahalli in North Bengaluru. Sumadhura is known in Bengaluru for finishing projects on time, and this one sits in the airport growth belt."),
 "prestige-eaton-park-sarjapur": ("sarjapur", "A low-density Prestige address on Sarjapur Road.", "Prestige Eaton Park is at Yamare, off Sarjapur Road. With 366 homes on about 7 acres, it is a smaller, quieter Prestige community close to the tech corridor."),
 "century-kindle-yelahanka-bangalore": ("north_city", "New homes at Yelahanka New Town, near a metro station in trial runs.", "Century Kindle is at Attur, Yelahanka New Town. Yelahanka is an established neighbourhood with its own station on the airport metro line."),
 "pavani-mirabilia-whitefield": ("whitefield", "Large homes at Whitefield, with the metro already running.", "Pavani Mirabilia is at Seegehalli, Whitefield. It offers bigger apartments in an area that has its jobs, schools and metro in place today."),
 "prestige-golfshire-devanahalli": ("north_airport", "Golf-course mansions at the foot of Nandi Hills.", "Prestige Golfshire is a 275-acre golf estate on Nandi Hills Road, Devanahalli. It is ready to move in: 206 mansions around an 18-hole course, with a resort hotel inside the estate."),
 "olivia-lt-raintree-boulevard-hebbal": ("north_hebbal", "L&T homes at Hebbal, where the airport road begins.", "Olivia is part of L&T Realty's Raintree Boulevard at Hebbal, on Bellary Road. Hebbal is the gateway between the city and the airport, and it is set to become a metro interchange."),
 "shriram-107-south-east-electronic-city-attibele": ("attibele", "Homes from ₹56.7 lakh near Electronic City.", "Shriram 107 South East is at Attibele, off Hosur Road. It is a large community at a price that lets a first-time buyer own a home near one of the city's biggest job hubs."),
 "amberstone-ventara-residences-sarjapur-road": ("sarjapur", "A 456-home community off Sarjapur Road.", "Amberstone Ventara Residences is at Chambenahalli, off Sarjapur Road. It is a mid-sized gated community aimed at families working in the eastern tech belt."),
}
os.makedirs(OUT, exist_ok=True)
for slug, (c, headline, pitch) in P.items():
    k = C[c]
    doc = {"checked": CHECKED, "corridor": c, "headline": headline, "pitch": pitch, "reasons": k["reasons"], "upcoming": k["upcoming"],
           "timeline": k.get("timeline"), "timelineSource": k.get("timelineSource"), "progress": k.get("progress"), "band": k.get("band"),
           "area": k.get("area"), "movers": {"up": k["up"], "down": k["down"]}}
    json.dump({a: b for a, b in doc.items() if b is not None}, open(os.path.join(OUT, f"{slug}.json"), "w"), ensure_ascii=False, indent=2)
print(len(P), "research files written")
