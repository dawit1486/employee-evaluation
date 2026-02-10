export const evaluationCriteria = [
    {
        id: 1,
        name: 'Technical Skill',
        nameAm: 'የቴክኒክ ብቃት',
        weight: '48%',
        subcriteria: [
            { id: '1_1', name: 'Job Knowledge', nameAm: 'ለሥራው ያለው ዕውቀት (ሥራውን ጠንቀቆ የማወቅ ችሎታ፤ - የሥራው መሰረታዊ እውቀት፤ የቴክኒክ ዕውቀትና ችሎታ፤ለችግሮች መፍትሄ የማፍለቅ እና ቅደም ተከተል የማውጣት ችሎታ፤ ውሳኔ የመወሰን አቅም፤)', weight: '30%', multiplier: 6 },
            { id: '1_2', name: 'Initiative and Creativity', nameAm: 'አዲስ የአሰራር ዘዴዎች መቀበልና የማፍለቅ ችሎታ (ውጤትን መተንበይ መቻል ለሥራ ያለው ተነሳሽነት፤አጠቃላይ ሁኔታዎችን ማገናዘብ መቻል፤አዲስ የአሰራር ዘዴ ወይም ቴክኒክ መፍጠር//ማዳበር መቻል፤ለአዳዲስ ሥራዎችና የአሰራር ዘዴዎች ያለው ዝግጁነትና ፈቃደኝነት)', weight: '10%', multiplier: 2 },
            { id: '1_3', name: 'Potential', nameAm: 'እምቅ ችሎታ/ብቃት (ካለበት ደረጃ በላይ ለኃላፊነት የሚያበቃ ብቃት)', weight: '8%', multiplier: 1.6 }
        ]
    },
    {
        id: 2,
        name: 'Sense of Concern & Cooperativeness',
        nameAm: 'ኃላፊነት የመሰማትና ተባባሪነት',
        weight: '21%',
        subcriteria: [
            { id: '2_1', name: 'Attendance', nameAm: 'የሥራ ሰዓት ማክበር (የሥራ መግቢያና መውጫ ሰዓትን ማክበር ሥራውን ያለ ቅርብ ክትትል የማከናወን ብቃት፤የሥራ ሰዓቱን በሥራ ላይ የማዋል፤ የተሰጠውን ስራ ከሥራ ሰዓት አሳልፎ የመስራት ፍላጎት)', weight: '3%', multiplier: 0.6 },
            { id: '2_2', name: 'Cooperation & Team work', nameAm: 'የመተባበርና አብሮ የመስራት ፍላጎት (ራስን ከሥራው፤ ከሠራተኞችና ከአካባቢው ጋር ማስለመድ መቻል፤ከኃላፊዎች፤ ከሥራ ባልደረቦችና ከሌሎች ጋር ያለው የሥራ ትብብር)', weight: '3%', multiplier: 0.6 },
            { id: '2_3', name: 'Personality', nameAm: 'ሁለንተናዊ ማንነት (በሥራ ቃል የገቡትን የመፈጸም አቅም መልካም አርያነትና ራስን መግለጽ፤መልካም ሥነ-ምግባር የድርጅቱን ሚስጢር መጠበቅ)', weight: '3%', multiplier: 0.6 },
            { id: '2_4', name: 'Customer Handling', nameAm: 'ደንበኛ አያያዝ (የደንበኛን ፍላጎት መረዳት መቻል፤ደንበኛን ማርካት መቻል)', weight: '5%', multiplier: 1 },
            { id: '2_5', name: 'Communication', nameAm: 'የሥራ ግንኙነት (ራስንና ሌሎችን ከአደጋ መጠበቅ ለእጅ መሳሪያዎች፤ ለማሽኖችና ለአጠቃላይ የድርጅቱ ንብረቶች የሚያደርገው ጥንቃቄ ያለውን እውቀትና ክህሎት ለሌሎች የማስተላለፍ፤ የመወያየት፤ የማዳመጥና ማገናዘብ ችሎታ)', weight: '4%', multiplier: 0.8 },
            { id: '2_6', name: "Concern for the company's Resource", nameAm: 'ለድርጅቱ ሀብት ተቆርቋሪነት (በአግባቡ ለመጠቀም የተደረገ ጥረት ለወጪ ቅነሳ የተደረገ ጥረት የተጎዳ ንብረት የመጠገን፤ የመሰብሰብና የማዳን ፍላጎት)', weight: '3%', multiplier: 0.6 }
        ]
    },
    {
        id: 3,
        name: 'Work Accomplishment Capacity',
        nameAm: 'ሥራ የማጠናቀቅ ብቃት',
        weight: '31%',
        subcriteria: [
            { id: '3_1', name: 'Meeting Objectives', nameAm: 'ሥራን ከግብ ማድረስ (የድርጅቱን ርዕይ፤ ተልዕኮና ግብ መረዳት መቻል፤የድርጅቱን፤ የመምሪያውን፤ የፕሮጀክቱን ዕቅድ ማወቅ፤ሥራን በጊዜው፤ በትክክልና በጥራት የማድረስ ችሎታ ተፈላጊ ውጤት ማምጣት)', weight: '16%', multiplier: 3.2 },
            { id: '3_2', name: 'Quality of Work', nameAm: 'የሥራ ጥራትና ትክክለኛነት', weight: '15%', multiplier: 3 }
        ]
    }
];
