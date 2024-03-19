// src/ml_tools/Dota2WinPrediction/heroes/DotaHeroAvatar.js
import Papa from 'papaparse';

const DotaHeroAvatar = [];

const csvData = `
"id","name","primary_attr","img"
0,Anti-Mage,agi,/img/Dota2WinPrediction/heroes/antimage.png
1,Axe,str,/img/Dota2WinPrediction/heroes/axe.png
2,Bane,all,/img/Dota2WinPrediction/heroes/bane.png
3,Bloodseeker,agi,/img/Dota2WinPrediction/heroes/bloodseeker.png
4,Crystal Maiden,int,/img/Dota2WinPrediction/heroes/crystal_maiden.png
5,Drow Ranger,agi,/img/Dota2WinPrediction/heroes/drow_ranger.png
6,Earthshaker,str,/img/Dota2WinPrediction/heroes/earthshaker.png
7,Juggernaut,agi,/img/Dota2WinPrediction/heroes/juggernaut.png
8,Mirana,all,/img/Dota2WinPrediction/heroes/mirana.png
9,Morphling,agi,/img/Dota2WinPrediction/heroes/morphling.png
10,Shadow Fiend,agi,/img/Dota2WinPrediction/heroes/nevermore.png
11,Phantom Lancer,agi,/img/Dota2WinPrediction/heroes/phantom_lancer.png
12,Puck,int,/img/Dota2WinPrediction/heroes/puck.png
13,Pudge,str,/img/Dota2WinPrediction/heroes/pudge.png
14,Razor,agi,/img/Dota2WinPrediction/heroes/razor.png
15,Sand King,all,/img/Dota2WinPrediction/heroes/sand_king.png
16,Storm Spirit,int,/img/Dota2WinPrediction/heroes/storm_spirit.png
17,Sven,str,/img/Dota2WinPrediction/heroes/sven.png
18,Tiny,str,/img/Dota2WinPrediction/heroes/tiny.png
19,Vengeful Spirit,all,/img/Dota2WinPrediction/heroes/vengefulspirit.png
20,Windranger,all,/img/Dota2WinPrediction/heroes/windrunner.png
21,Zeus,int,/img/Dota2WinPrediction/heroes/zuus.png
22,Kunkka,str,/img/Dota2WinPrediction/heroes/kunkka.png
23,Lina,int,/img/Dota2WinPrediction/heroes/lina.png
24,Lion,int,/img/Dota2WinPrediction/heroes/lion.png
25,Shadow Shaman,int,/img/Dota2WinPrediction/heroes/shadow_shaman.png
26,Slardar,str,/img/Dota2WinPrediction/heroes/slardar.png
27,Tidehunter,str,/img/Dota2WinPrediction/heroes/tidehunter.png
28,Witch Doctor,int,/img/Dota2WinPrediction/heroes/witch_doctor.png
29,Lich,int,/img/Dota2WinPrediction/heroes/lich.png
30,Riki,agi,/img/Dota2WinPrediction/heroes/riki.png
31,Enigma,all,/img/Dota2WinPrediction/heroes/enigma.png
32,Tinker,int,/img/Dota2WinPrediction/heroes/tinker.png
33,Sniper,agi,/img/Dota2WinPrediction/heroes/sniper.png
34,Necrophos,int,/img/Dota2WinPrediction/heroes/necrolyte.png
35,Warlock,int,/img/Dota2WinPrediction/heroes/warlock.png
36,Beastmaster,all,/img/Dota2WinPrediction/heroes/beastmaster.png
37,Queen of Pain,int,/img/Dota2WinPrediction/heroes/queenofpain.png
38,Venomancer,all,/img/Dota2WinPrediction/heroes/venomancer.png
39,Faceless Void,agi,/img/Dota2WinPrediction/heroes/faceless_void.png
40,Wraith King,str,/img/Dota2WinPrediction/heroes/skeleton_king.png
41,Death Prophet,int,/img/Dota2WinPrediction/heroes/death_prophet.png
42,Phantom Assassin,agi,/img/Dota2WinPrediction/heroes/phantom_assassin.png
43,Pugna,int,/img/Dota2WinPrediction/heroes/pugna.png
44,Templar Assassin,agi,/img/Dota2WinPrediction/heroes/templar_assassin.png
45,Viper,agi,/img/Dota2WinPrediction/heroes/viper.png
46,Luna,agi,/img/Dota2WinPrediction/heroes/luna.png
47,Dragon Knight,str,/img/Dota2WinPrediction/heroes/dragon_knight.png
48,Dazzle,all,/img/Dota2WinPrediction/heroes/dazzle.png
49,Clockwerk,all,/img/Dota2WinPrediction/heroes/rattletrap.png
50,Leshrac,int,/img/Dota2WinPrediction/heroes/leshrac.png
51,Nature's Prophet,int,/img/Dota2WinPrediction/heroes/furion.png
52,Lifestealer,str,/img/Dota2WinPrediction/heroes/life_stealer.png
53,Dark Seer,all,/img/Dota2WinPrediction/heroes/dark_seer.png
54,Clinkz,agi,/img/Dota2WinPrediction/heroes/clinkz.png
55,Omniknight,str,/img/Dota2WinPrediction/heroes/omniknight.png
56,Enchantress,int,/img/Dota2WinPrediction/heroes/enchantress.png
57,Huskar,str,/img/Dota2WinPrediction/heroes/huskar.png
58,Night Stalker,str,/img/Dota2WinPrediction/heroes/night_stalker.png
59,Broodmother,all,/img/Dota2WinPrediction/heroes/broodmother.png
60,Bounty Hunter,agi,/img/Dota2WinPrediction/heroes/bounty_hunter.png
61,Weaver,agi,/img/Dota2WinPrediction/heroes/weaver.png
62,Jakiro,int,/img/Dota2WinPrediction/heroes/jakiro.png
63,Batrider,all,/img/Dota2WinPrediction/heroes/batrider.png
64,Chen,all,/img/Dota2WinPrediction/heroes/chen.png
65,Spectre,agi,/img/Dota2WinPrediction/heroes/spectre.png
66,Ancient Apparition,int,/img/Dota2WinPrediction/heroes/ancient_apparition.png
67,Doom,str,/img/Dota2WinPrediction/heroes/doom_bringer.png
68,Ursa,agi,/img/Dota2WinPrediction/heroes/ursa.png
69,Spirit Breaker,str,/img/Dota2WinPrediction/heroes/spirit_breaker.png
70,Gyrocopter,agi,/img/Dota2WinPrediction/heroes/gyrocopter.png
71,Alchemist,str,/img/Dota2WinPrediction/heroes/alchemist.png
72,Invoker,all,/img/Dota2WinPrediction/heroes/invoker.png
73,Silencer,int,/img/Dota2WinPrediction/heroes/silencer.png
74,Outworld Devourer,int,/img/Dota2WinPrediction/heroes/obsidian_destroyer.png
75,Lycan,all,/img/Dota2WinPrediction/heroes/lycan.png
76,Brewmaster,all,/img/Dota2WinPrediction/heroes/brewmaster.png
77,Shadow Demon,int,/img/Dota2WinPrediction/heroes/shadow_demon.png
78,Lone Druid,all,/img/Dota2WinPrediction/heroes/lone_druid.png
79,Chaos Knight,str,/img/Dota2WinPrediction/heroes/chaos_knight.png
80,Meepo,agi,/img/Dota2WinPrediction/heroes/meepo.png
81,Treant Protector,str,/img/Dota2WinPrediction/heroes/treant.png
82,Ogre Magi,str,/img/Dota2WinPrediction/heroes/ogre_magi.png
83,Undying,str,/img/Dota2WinPrediction/heroes/undying.png
84,Rubick,int,/img/Dota2WinPrediction/heroes/rubick.png
85,Disruptor,int,/img/Dota2WinPrediction/heroes/disruptor.png
86,Nyx Assassin,all,/img/Dota2WinPrediction/heroes/nyx_assassin.png
87,Naga Siren,agi,/img/Dota2WinPrediction/heroes/naga_siren.png
88,Keeper of the Light,int,/img/Dota2WinPrediction/heroes/keeper_of_the_light.png
89,Io,all,/img/Dota2WinPrediction/heroes/wisp.png
90,Visage,all,/img/Dota2WinPrediction/heroes/visage.png
91,Slark,agi,/img/Dota2WinPrediction/heroes/slark.png
92,Medusa,agi,/img/Dota2WinPrediction/heroes/medusa.png
93,Troll Warlord,agi,/img/Dota2WinPrediction/heroes/troll_warlord.png
94,Centaur Warrunner,str,/img/Dota2WinPrediction/heroes/centaur.png
95,Magnus,all,/img/Dota2WinPrediction/heroes/magnataur.png
96,Timbersaw,all,/img/Dota2WinPrediction/heroes/shredder.png
97,Bristleback,str,/img/Dota2WinPrediction/heroes/bristleback.png
98,Tusk,str,/img/Dota2WinPrediction/heroes/tusk.png
99,Skywrath Mage,int,/img/Dota2WinPrediction/heroes/skywrath_mage.png
100,Abaddon,all,/img/Dota2WinPrediction/heroes/abaddon.png
101,Elder Titan,str,/img/Dota2WinPrediction/heroes/elder_titan.png
102,Legion Commander,str,/img/Dota2WinPrediction/heroes/legion_commander.png
103,Techies,all,/img/Dota2WinPrediction/heroes/techies.png
104,Ember Spirit,agi,/img/Dota2WinPrediction/heroes/ember_spirit.png
105,Earth Spirit,str,/img/Dota2WinPrediction/heroes/earth_spirit.png
106,Underlord,str,/img/Dota2WinPrediction/heroes/abyssal_underlord.png
107,Terrorblade,agi,/img/Dota2WinPrediction/heroes/terrorblade.png
108,Phoenix,all,/img/Dota2WinPrediction/heroes/phoenix.png
109,Oracle,int,/img/Dota2WinPrediction/heroes/oracle.png
110,Winter Wyvern,all,/img/Dota2WinPrediction/heroes/winter_wyvern.png
111,Arc Warden,agi,/img/Dota2WinPrediction/heroes/arc_warden.png
112,Monkey King,agi,/img/Dota2WinPrediction/heroes/monkey_king.png
113,Dark Willow,all,/img/Dota2WinPrediction/heroes/dark_willow.png
114,Pangolier,all,/img/Dota2WinPrediction/heroes/pangolier.png
115,Grimstroke,int,/img/Dota2WinPrediction/heroes/grimstroke.png
116,Hoodwink,agi,/img/Dota2WinPrediction/heroes/hoodwink.png
117,Void Spirit,all,/img/Dota2WinPrediction/heroes/void_spirit.png
118,Snapfire,all,/img/Dota2WinPrediction/heroes/snapfire.png
119,Mars,str,/img/Dota2WinPrediction/heroes/mars.png
120,Dawnbreaker,str,/img/Dota2WinPrediction/heroes/dawnbreaker.png
121,Marci,all,/img/Dota2WinPrediction/heroes/marci.png
122,Primal Beast,str,/img/Dota2WinPrediction/heroes/primal_beast.png
123,Muerta,int,/img/Dota2WinPrediction/heroes/muerta.png
`;

Papa.parse(csvData, {
  header: true,
  skipEmptyLines: true,
  complete: function (result) {
    result.data.forEach((hero) => {
      DotaHeroAvatar.push({
        id: hero.id,
        avatar: hero.img,
        name: hero.name,
        primary_attr: hero.primary_attr
      });
    });
  },
});

export default DotaHeroAvatar;
