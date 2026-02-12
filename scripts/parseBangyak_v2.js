/**
 * 방약합편 텍스트 파일을 구조화된 JSON으로 파싱하는 스크립트 (v2)
 * 
 * v1 대비 개선사항:
 *   - 주치증 / 가감법 / 복용법 / 적응증을 구조적으로 분리
 *   - 가감법을 { condition, changes: [{herb, action, detail}], original } 형태로 정형화
 *   - 복용법(用法/調劑法)을 dosageMethod 필드로 분리
 *   - 원문 텍스트 보존 (파일 내 글자 첨가/수정 금지)
 * 
 * 사용법: node scripts/parseBangyak_v2.js
 * 출력: public/bangyak-prescriptions-v2.json
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import iconv from 'iconv-lite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ═══════════════════════════════════════════════════════════
// 한자 → 한글 약재명 매핑 사전
// ═══════════════════════════════════════════════════════════
const HANJA_TO_HANGUL = {
    // ㄱ
    '甘草': '감초',
    '乾葛': '건갈',
    '乾薑': '건강',
    '乾地黃': '건지황',
    '桔梗': '길경',
    '桂心': '계심',
    '桂皮': '계피',
    '桂枝': '계지',
    '官桂': '관계',
    '瓜蔞仁': '과루인',
    '枸杞子': '구기자',
    '龜板': '구판',
    '藁本': '고본',
    '草果': '초과',
    '金銀花': '금은화',
    '金櫻子': '금앵자',
    '芡仁': '검인',
    '菊花': '국화',
    '苦蔘': '고삼',
    '良薑': '양강',

    // ㄴ
    '牛膝': '우슬',
    '牛黃': '우황',
    '南星': '남성',
    '龍腦': '용뇌',

    // ㄷ
    '當歸': '당귀',
    '當歸身': '당귀신',
    '當歸尾': '당귀미',
    '大棗': '대조',
    '大黃': '대황',
    '大腹皮': '대복피',
    '獨活': '독활',
    '杜冲': '두충',
    '丹參': '단삼',
    '丁香': '정향',

    // ㄹ
    '龍眼肉': '용안육',
    '龍骨': '용골',
    '鹿茸': '녹용',
    '鹿角膠': '녹각교',
    '鹿角霜': '녹각상',
    '連翹': '연교',
    '蓮肉': '연육',

    // ㅁ
    '麻黃': '마황',
    '麻黃根': '마황근',
    '麥門冬': '맥문동',
    '麥芽': '맥아',
    '牡丹皮': '모단피',
    '牧丹皮': '모단피',
    '牡蠣': '모려',
    '牡荊': '모형',
    '木瓜': '목과',
    '木香': '목향',
    '木通': '목통',
    '蔓荊子': '만형자',
    '麝香': '사향',
    '沒藥': '몰약',
    '木鱉子': '목별자',
    '木綿子仁': '목면자인',

    // ㅂ
    '半夏': '반하',
    '白芍藥': '백작약',
    '白朮': '백출',
    '白茯苓': '백복령',
    '白茯神': '백복신',
    '白芷': '백지',
    '白扁豆': '백편두',
    '白豆蔲': '백두구',
    '白鮮皮': '백선피',
    '白殭蠶': '백강잠',
    '白蒺藜': '백질려',
    '白芨': '백급',
    '白檀香': '백단향',
    '附子': '부자',
    '防風': '방풍',
    '防己': '방기',
    '巴戟': '파극',
    '巴豆霜': '파두상',
    '薄荷': '박하',
    '檳榔': '빈랑',
    '貝母': '패모',
    '便香附': '편향부',
    '蓬朮': '봉출',
    '破故紙': '파고지',
    '浮小麥': '부소맥',
    '柏子仁': '백자인',

    // ㅅ
    '砂仁': '사인',
    '縮砂': '축사',
    '蛇床子': '사상자',
    '山藥': '산약',
    '山茱萸': '산수유',
    '山査肉': '산사육',
    '山梔子': '산치자',
    '酸棗仁': '산조인',
    '桑螵蛸': '상표소',
    '桑白皮': '상백피',
    '三稜': '삼릉',
    '生薑': '생강',
    '生地黃': '생지황',
    '生乾地黃': '생건지황',
    '石膏': '석고',
    '石斛': '석곡',
    '石菖蒲': '석창포',
    '石雄黃': '석웅황',
    '細辛': '세신',
    '蘇葉': '소엽',
    '蘇木': '소목',
    '續斷': '속단',
    '熟地黃': '숙지황',
    '升麻': '승마',
    '神麯': '신곡',
    '沈香': '침향',
    '犀角': '서각',
    '使君子': '사군자',
    '砂糖': '사탕',
    '柿霜': '시상',

    // ㅇ
    '羊腎': '양신',
    '杏仁': '행인',
    '薏苡仁': '의이인',
    '益智仁': '익지인',
    '遠志': '원지',
    '五味子': '오미자',
    '五靈脂': '오령지',
    '五加皮': '오가피',
    '烏藥': '오약',
    '烏梅': '오매',
    '玄參': '현삼',
    '玄蔘': '현삼',
    '玄胡索': '현호색',
    '鬱金': '울금',
    '肉蓯蓉': '육종용',
    '肉桂': '육계',
    '肉豆蔲': '육두구',
    '茵陳': '인진',
    '橘皮': '귤피',
    '橘紅': '귤홍',
    '艾葉': '애엽',
    '羚羊角': '영양각',

    // ㅈ
    '紫蘇': '자소',
    '紫河車': '자하거',
    '磁石': '자석',
    '芍藥': '작약',
    '赤芍藥': '적작약',
    '全蝎': '전갈',
    '赤茯苓': '적복령',
    '赤小豆': '적소두',
    '梔子': '치자',
    '知母': '지모',
    '地骨皮': '지골피',
    '地楡': '지유',
    '澤瀉': '택사',
    '澤蘭葉': '택란엽',
    '竹瀝': '죽력',
    '竹茹': '죽여',
    '竹葉': '죽엽',
    '枳實': '지실',
    '枳殼': '지각',
    '猪苓': '저령',
    '朱砂': '주사',
    '前胡': '전호',

    // ㅊ
    '川芎': '천궁',
    '川烏': '천오',
    '川椒': '천초',
    '菖蒲': '창포',
    '蒼朮': '창출',
    '蒼耳子': '창이자',
    '天麻': '천마',
    '天門冬': '천문동',
    '天南星': '천남성',
    '靑皮': '청피',
    '車前子': '차전자',
    '陳皮': '진피',
    '穿山甲': '천산갑',

    // ㅋ ㅌ
    '土茯苓': '토복령',
    '兎絲子': '토사자',
    '菟絲子': '토사자',
    '茴香': '회향',
    '訶子': '가자',

    // ㅍ
    '八珍': '팔진',
    '片芩': '편금',
    '茯苓': '복령',
    '茯神': '복신',
    '蒲黃': '포황',

    // ㅎ
    '何首烏': '하수오',
    '荷葉': '하엽',
    '香附子': '향부자',
    '香附米': '향부미',
    '香薷': '향유',
    '厚朴': '후박',
    '黃芪': '황기',
    '黃芩': '황금',
    '黃柏': '황백',
    '黃連': '황련',
    '黃丹': '황단',
    '花椒': '화초',
    '滑石': '활석',
    '荊芥': '형개',
    '紅花': '홍화',
    '胡桃': '호도',
    '海螵蛸': '해표초',
    '硼砂': '붕사',
    '琥珀': '호박',

    // 기타
    '人蔘': '인삼',
    '人參': '인삼',
    '蔘': '삼',
    '粳米': '갱미',
    '秦皮': '진피',
    '秦艽': '진교',
    '柴胡': '시호',
    '羌活': '강활',
    '葱白': '총백',
    '蜂蜜': '봉밀',
    '阿膠': '아교',
    '吳茱萸': '오수유',
    '葛根': '갈근',
    '藿香': '곽향',
    '皂角刺': '조각자',
    '萆薢': '비해',
    '萆麻子仁': '비마자인',
    '麻子仁': '마자인',
    '乳香': '유향',
    '輕粉': '경분',
    '鐘乳粉': '종유분',
    '枯白礬': '고백반',
    '牛蒡子': '우방자',
    '冬葵子': '동규자',
    '瞿麥': '구맥',
    '木鱉子': '목별자',
};

// ═══════════════════════════════════════════════════════════
// 가감법 파싱: 약재 변경 액션 패턴
// ═══════════════════════════════════════════════════════════

/**
 * 한자 약재명을 한글로 변환
 */
function hanjaToHangul(hanja) {
    if (HANJA_TO_HANGUL[hanja]) {
        return HANJA_TO_HANGUL[hanja];
    }
    // 수치(修治) 접미사 제거 후 재시도
    const cleaned = hanja.replace(/(酒炒|薑炒|炒|炮|煨|蜜炙|土炒|酒浸|生)$/, '');
    if (cleaned !== hanja && HANJA_TO_HANGUL[cleaned]) {
        return HANJA_TO_HANGUL[cleaned];
    }
    // 부분 매칭 시도
    for (const [key, value] of Object.entries(HANJA_TO_HANGUL)) {
        if (hanja.includes(key)) {
            const rest = hanja.replace(key, '').trim();
            return rest ? value + ' (' + rest + ')' : value;
        }
    }
    return hanja;
}

/**
 * 약재 라인 파싱 (예: "人蔘3 白朮3" → [{name: "인삼", amount: 3, unit: "g"}, ...])
 */
function parseHerbLine(line) {
    const herbs = [];
    const pattern = /([^\d\s]+?)(\d+(?:\.\d+)?)/g;
    let match;
    while ((match = pattern.exec(line)) !== null) {
        const hanjaName = match[1].trim();
        const amount = parseFloat(match[2]);
        if (hanjaName && !isNaN(amount)) {
            herbs.push({
                name: hanjaToHangul(hanjaName),
                hanja: hanjaName,
                amount: amount,
                unit: 'g'
            });
        }
    }
    return herbs;
}

/**
 * 처방 헤더 파싱 (예: "上統 1 신력탕(腎瀝湯)")
 */
function parseHeader(line) {
    const match = line.match(/^(上統|中統|下統)\s*(\d+)\s*(.+)$/);
    if (!match) return null;

    const category = match[1];
    const number = parseInt(match[2]);
    const namepart = match[3].trim();

    const namematch = namepart.match(/^(.+?)\((.+?)\)$/);
    let name, hanjaName;
    if (namematch) {
        name = namematch[1].trim();
        hanjaName = namematch[2].trim();
    } else {
        name = namepart;
        hanjaName = '';
    }

    return { category, number, name, hanjaName };
}

// ═══════════════════════════════════════════════════════════
// 가감법 구조화 파싱
// ═══════════════════════════════════════════════════════════

// 알려진 약재명 목록 (한자) - HANJA_TO_HANGUL 키에서 추출
const KNOWN_HERBS = new Set(Object.keys(HANJA_TO_HANGUL));

/**
 * 텍스트에서 한자 약재명을 찾아 반환
 */
function findHerbsInText(text) {
    const found = [];
    // 긴 이름부터 먼저 매칭 (예: 生乾地黃 vs 地黃)
    const sortedHerbs = [...KNOWN_HERBS].sort((a, b) => b.length - a.length);
    let remaining = text;

    for (const herb of sortedHerbs) {
        if (remaining.includes(herb)) {
            found.push(herb);
            // 중복 매칭 방지
            remaining = remaining.replaceAll(herb, '□'.repeat(herb.length));
        }
    }
    return found;
}

/**
 * 개별 가감법 항목에서 약재 변경 사항을 추출
 * 
 * 패턴들:
 *   - "A을(를) 加한다/가한다/넣는다/넣고"
 *   - "A을(를) 빼고/뺀다/빼면"
 *   - "A을(를) 倍(로)/배(로)/倍加/倍量"
 *   - "A을(를) 增量/~錢으로"
 *   - "A과(와) 合方"
 *   - "A를 조금 가하여"
 *   - "A 등을 加한다"
 */
function parseHerbChanges(text) {
    const changes = [];
    const herbsInText = findHerbsInText(text);

    if (herbsInText.length === 0) return changes;

    for (const herb of herbsInText) {
        // 해당 약재 주변 문맥을 검사하여 action 결정
        const action = determineAction(text, herb);
        const detail = extractDetail(text, herb, action);

        changes.push({
            herb: herb,
            herbKo: hanjaToHangul(herb),
            action: action,
            detail: detail || undefined,
        });
    }

    return changes;
}

/**
 * 텍스트에서 약재에 대한 액션(加/去/倍/增量/合方) 결정
 */
function determineAction(text, herb) {
    // 약재 이후 & 이전 문맥 확인
    const herbIdx = text.indexOf(herb);
    const after = text.substring(herbIdx + herb.length);
    const before = text.substring(0, herbIdx);

    // 倍 패턴 (倍로, 倍加, 倍量, 배로) - 加보다 먼저 검사
    if (/을\s*倍|를\s*倍|을\s*배로|를\s*배로/.test(text.substring(herbIdx - 5, herbIdx + herb.length + 10)) ||
        /倍로|倍加|倍量|배로/.test(after.substring(0, 15))) {
        return '倍';
    }

    // 增量 패턴 (增量, ~錢으로)
    if (/增量/.test(after.substring(0, 15)) ||
        /\d+\s*[~～]\s*\d+\s*錢으로/.test(after.substring(0, 20)) ||
        /\d+錢으로/.test(after.substring(0, 15))) {
        return '增量';
    }

    // 去/빼 패턴 (빼고, 뺀다, 빼면, 去)
    if (/빼고|뺀다|빼면|를\s*빼/.test(after.substring(0, 10)) ||
        /을\s*빼|를\s*빼/.test(text.substring(herbIdx - 3, herbIdx + herb.length + 5)) ||
        /빼고/.test(after.substring(0, 8))) {
        return '去';
    }

    // 合方 패턴
    if (/合方/.test(after.substring(0, 10))) {
        return '合方';
    }

    // 加 패턴 (加한다, 가한다, 넣는다, 넣고, 가하고, 加하고)
    if (/加|가하|넣/.test(after.substring(0, 15)) ||
        /를\s*加|을\s*加|를\s*가|을\s*가/.test(text.substring(herbIdx - 3, herbIdx + herb.length + 10))) {
        return '加';
    }

    // 문맥이 불분명한 경우, 전체 문장에서 패턴 검사
    if (/加한다|가한다|넣는다|加하/.test(text)) return '加';
    if (/빼고|뺀다/.test(text)) return '去';
    if (/倍로|倍加/.test(text)) return '倍';

    return '기타';
}

/**
 * 약재 변경의 부가 설명 추출 (예: "조금", "5錢으로", "倍로")
 */
function extractDetail(text, herb, action) {
    const herbIdx = text.indexOf(herb);
    const after = text.substring(herbIdx + herb.length, herbIdx + herb.length + 30);

    if (action === '倍') {
        const m = after.match(/(倍로|倍加|倍量|배로)/);
        return m ? m[1] : '倍';
    }

    if (action === '增量') {
        const m = after.match(/(\d+\s*[~～]?\s*\d*\s*錢으로\s*增量|\d+\s*[~～]\s*\d+\s*錢으로|\d+錢)/);
        return m ? m[1] : null;
    }

    // "조금", "약간" 등 수식어
    const modifierMatch = after.match(/^을?\s*(조금|약간)\s*(加|가)/);
    if (modifierMatch) {
        return modifierMatch[1];
    }

    // 용량 지정 (예: "一錢", "5錢")
    const dosageMatch = after.match(/\s*(\d+錢|[一二三四五六七八九十]+錢)/);
    if (dosageMatch) {
        return dosageMatch[1];
    }

    return null;
}

/**
 * 연번(①②③...) 기준으로 텍스트를 개별 항목으로 분리
 */
function splitByCircledNumbers(text) {
    // ①②③...⑮ 또는 문장 시작 기준으로 분리
    const parts = [];
    // 연번 패턴으로 분할
    const regex = /[①②③④⑤⑥⑦⑧⑨⑩⑪⑫⑬⑭⑮]/g;
    const indices = [];
    let m;
    while ((m = regex.exec(text)) !== null) {
        indices.push(m.index);
    }

    if (indices.length === 0) {
        // 연번이 없으면 전체를 하나의 항목으로
        return [text.trim()].filter(Boolean);
    }

    // 연번 앞 부분 (첫 번째 연번 이전의 텍스트)
    const beforeFirst = text.substring(0, indices[0]).trim();
    if (beforeFirst) {
        parts.push(beforeFirst);
    }

    // 각 연번 항목
    for (let i = 0; i < indices.length; i++) {
        const start = indices[i];
        const end = i + 1 < indices.length ? indices[i + 1] : text.length;
        const part = text.substring(start, end).trim();
        // 연번 기호 제거
        const cleaned = part.replace(/^[①②③④⑤⑥⑦⑧⑨⑩⑪⑫⑬⑭⑮]\s*/, '').trim();
        if (cleaned) {
            parts.push(cleaned);
        }
    }

    return parts;
}

/**
 * 가감법 항목에서 조건(condition)을 추출
 * 패턴: "A에는", "A하면", "A한 데는", "A이면", "A일 때"
 */
function extractCondition(text) {
    // 패턴 매칭으로 조건 추출
    const patterns = [
        // "~에는 약재를 ~한다" 패턴
        /^(.+?(?:에는|에서는|에))\s/,
        // "~하면 약재를 ~한다" 패턴
        /^(.+?(?:하면|되면|가면|나면|오면|있으면|없으면|못하면|않으면|많으면|적으면|심하면|빠르면|같으면|좋으면|세면|없을\s*때|낫지\s*않으면|지면|넣으면|쓰면))\s/,
        // "~한 데는" 패턴
        /^(.+?(?:한\s*데는|한\s*데에|된\s*데에는|된\s*데는|하는\s*데는|하는\s*데에는))\s/,
        // "~일 때" 패턴  
        /^(.+?(?:일\s*때는?|할\s*때는?))\s/,
        // "~이면" 패턴
        /^(.+?(?:이면|라면))\s/,
        // "~은/는" 화제 조사 (조건 역할): "虛한 사람과 노인은", "陶氏補中益氣湯은"
        /^(.{3,}?[은는])\s/,
        // "~가 ~하면" 더 넓은 패턴
        /^(.+?(?:이\s+.+?에는|가\s+.+?하면))\s/,
    ];

    for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match) {
            return match[1].trim();
        }
    }

    // 조건을 찾지 못한 경우
    return null;
}

/**
 * 복용법 관련 키워드 감지
 */
const DOSAGE_KEYWORDS = [
    '空心服', '空心에', '食後', '食前', '水煎', '煎服', '溫服', '冷服',
    '丸을 지어', '丸을 만들', '作末', '가루로', '蜜丸', '糊丸',
    '삼킨다', '하루 세 번', '하루 두번', '一日', '三會', '服用한다', '服用',
    '달여', '달인', '먹는다', '마신다', '재탕', 'Re煎', '分服',
    '分作', '貼으로', '十貼', '二十貼', '잘게 썰어'
];

// 단독 복용법 전용 패턴 (이것만 있으면 복용법으로 판단)
const DOSAGE_ONLY_PATTERNS = [
    /^空心.{0,3}服/, /^食後.{0,5}服/, /^食前.{0,5}服/,
    /^一日\s*[三二]/, /^水煎服/,
];

/**
 * 텍스트가 복용법에 해당하는지 판단
 */
function isDosageMethod(text) {
    // 단독 복용법 패턴 체크 (짧은 텍스트에 대해)
    for (const pattern of DOSAGE_ONLY_PATTERNS) {
        if (pattern.test(text.trim())) return true;
    }

    let matchCount = 0;
    for (const keyword of DOSAGE_KEYWORDS) {
        if (text.includes(keyword)) matchCount++;
    }
    // 복용법 키워드가 2개 이상이거나, 약재 변경 키워드 없이 1개 이상
    const hasModKeyword = /加한다|가한다|빼고|뺀다|倍로|倍加|增量|合方/.test(text);
    return matchCount >= 2 || (matchCount >= 1 && !hasModKeyword);
}

/**
 * [活套] 블록에서 가감법 항목들을 구조화
 */
function parseModificationBlock(text) {
    const modifications = [];
    const dosageItems = [];

    // [活套] 태그 제거
    const cleanText = text.replace(/^\[活套\]\s*/, '').trim();

    // 연번 기준으로 분리
    const items = splitByCircledNumbers(cleanText);

    for (const item of items) {
        if (!item.trim()) continue;

        // 복용법에 해당하면 별도 수집
        if (isDosageMethod(item) && !findHerbsInText(item).length) {
            dosageItems.push(item.trim());
            continue;
        }

        const condition = extractCondition(item);
        const changes = parseHerbChanges(item);

        modifications.push({
            condition: condition,
            changes: changes,
            original: item.trim(),
        });
    }

    return { modifications, dosageItems };
}

/**
 * 주치증 텍스트에 인라인으로 포함된 가감법 항목을 분리
 * (예: "~를 다스린다. ① A에는 B를 加한다.")
 */
function separateInlineModifications(text) {
    const parts = splitByCircledNumbers(text);

    if (parts.length <= 1) {
        return { indication: text.trim(), inlineItems: [] };
    }

    // 첫 번째 항목이 주치증 (다스린다/치료한다로 끝나는 것)
    const indication = parts[0].trim();
    const inlineItems = parts.slice(1);

    return { indication, inlineItems };
}

/**
 * [用法]/[調劑法] 등에서 복용법 추출
 */
function parseDosageSection(text) {
    // 태그 제거
    const clean = text
        .replace(/^\[(用法|용법|調劑法)\]\s*/, '')
        .trim();

    // 연번으로 분리된 항목도 포함
    const parts = splitByCircledNumbers(clean);
    return parts.join(' ');
}

// ═══════════════════════════════════════════════════════════
// 전체 파일 파싱
// ═══════════════════════════════════════════════════════════

function parseBangyakFile(content) {
    const lines = content.split('\n');
    const prescriptions = [];

    let currentPrescription = null;
    let currentSection = null; // 'herbs' or 'description'

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        if (!line) {
            if (currentPrescription && currentSection === 'herbs') {
                currentSection = 'description';
            }
            continue;
        }

        // 새 처방 시작
        if (line.match(/^(上統|中統|下統)\s*\d+/)) {
            if (currentPrescription && currentPrescription.herbs.length > 0) {
                prescriptions.push(finalizePrescription(currentPrescription));
            }

            const header = parseHeader(line);
            if (header) {
                currentPrescription = {
                    ...header,
                    herbs: [],
                    rawIndication: '',       // 원문 주치증
                    rawModification: [],     // [活套] 원문
                    rawDosage: [],           // [用法] 원문
                    rawIndications: [],      // [適應症] 원문
                    inlineItems: [],         // 주치증 내 인라인 연번 항목
                };
                currentSection = 'herbs';
            }
            continue;
        }

        if (!currentPrescription) continue;

        // 약재 라인
        if (currentSection === 'herbs' && /^[^\s\[\]①②③④⑤].*\d+/.test(line) && !/다스린다|치료한다|용한다/.test(line)) {
            const herbs = parseHerbLine(line);
            currentPrescription.herbs.push(...herbs);
            continue;
        }

        // 설명 부분
        if (currentSection === 'description' || currentSection === 'herbs') {
            currentSection = 'description';

            // [活套] 섹션
            if (line.startsWith('[活套]')) {
                currentPrescription.rawModification.push(line);
            }
            // [用法]/[용법]/[調劑法] 섹션
            else if (line.startsWith('[用法]') || line.startsWith('[용법]') || line.startsWith('[調劑法]')) {
                currentPrescription.rawDosage.push(line);
            }
            // [適應症]/[적응증] 섹션
            else if (line.startsWith('[適應症]') || line.startsWith('[적응증]')) {
                currentPrescription.rawIndications.push(line.replace(/^\[(適應症|적응증)\]\s*/, '').trim());
            }
            // 일반 텍스트 → 주치증 (첫 번째 일반 설명)
            else {
                if (!currentPrescription.rawIndication) {
                    currentPrescription.rawIndication = line;
                } else {
                    // 추가 설명은 modification에 추가
                    currentPrescription.rawModification.push(line);
                }
            }
        }
    }

    // 마지막 처방
    if (currentPrescription && currentPrescription.herbs.length > 0) {
        prescriptions.push(finalizePrescription(currentPrescription));
    }

    return prescriptions;
}

/**
 * 처방 객체 최종 정리 및 구조화
 */
function finalizePrescription(raw) {
    const now = new Date().toISOString();

    // 1. 주치증에서 인라인 가감법 분리
    const { indication, inlineItems } = separateInlineModifications(raw.rawIndication);

    // 2. 가감법 구조화
    const modifications = [];

    // 2a. 인라인 항목 처리
    for (const item of inlineItems) {
        const condition = extractCondition(item);
        const changes = parseHerbChanges(item);
        modifications.push({
            condition: condition,
            changes: changes,
            original: item.trim(),
        });
    }

    // 2b. [活套] 블록 처리
    const dosageParts = [];
    for (const block of raw.rawModification) {
        const { modifications: blockMods, dosageItems } = parseModificationBlock(block);
        modifications.push(...blockMods);
        dosageParts.push(...dosageItems);
    }

    // 3. 복용법 합산

    // 3a. [用法] 블록
    for (const d of raw.rawDosage) {
        dosageParts.push(parseDosageSection(d));
    }

    // 3b. 가감법 중 복용법에 해당하는 것들 및 비-가감법 항목 분리
    const finalModifications = [];
    const extraNotes = [];
    for (const mod of modifications) {
        if (isDosageMethod(mod.original) && mod.changes.length === 0) {
            // 복용법으로 분류
            dosageParts.push(mod.original);
        } else if (mod.changes.length === 0 && !mod.condition) {
            // 약재 변경도 없고 조건도 없는 항목 → notes로 분류
            // (예: "일명 八珍湯이다", "이것은 建中湯과 四物湯을 合方한 것이다")
            extraNotes.push(mod.original);
        } else {
            finalModifications.push(mod);
        }
    }

    // 4. 원문 전체 (modification 필드 호환용)
    const allRawTexts = [];
    if (inlineItems.length > 0) {
        allRawTexts.push(...inlineItems.map((item, i) => `① ${item}`.replace('①', String.fromCodePoint(0x2460 + i))));
    }
    allRawTexts.push(...raw.rawModification);

    return {
        id: `bangyak-${raw.category}-${raw.number}`,
        name: raw.name,
        hanja: raw.hanjaName || undefined,
        herbs: raw.herbs,
        source: `방약합편 (${raw.category} ${raw.number})`,

        // 주치증 (원문)
        indication: indication || undefined,

        // 구조화된 가감법
        modifications: finalModifications.length > 0 ? finalModifications : undefined,

        // 원문 가감법 텍스트 (호환용)
        modification: allRawTexts.length > 0 ? allRawTexts.join('\n') : undefined,

        // 복용법
        dosageMethod: dosageParts.length > 0 ? dosageParts.join(' ') : undefined,

        // 적응증 키워드
        indications: raw.rawIndications.length > 0 ? raw.rawIndications : undefined,

        // 한자명 및 기타 노트
        notes: [
            raw.hanjaName ? `한자명: ${raw.hanjaName}` : null,
            ...extraNotes,
        ].filter(Boolean).join('\n') || undefined,

        createdAt: now,
        updatedAt: now,
    };
}

// ═══════════════════════════════════════════════════════════
// 메인 함수
// ═══════════════════════════════════════════════════════════

async function main() {
    const inputPath = path.join(__dirname, '..', 'data', 'bangyak.txt');
    const outputPath = path.join(__dirname, '..', 'public', 'bangyak-prescriptions-v2.json');

    console.log('📖 방약합편 파싱 v2 시작...');
    console.log(`   입력: ${inputPath}`);

    // UTF-16LE 파일 읽기
    const buffer = fs.readFileSync(inputPath);
    const content = iconv.decode(buffer, 'UTF-16LE');
    const cleanContent = content.replace(/^\uFEFF/, '');

    // 파싱
    const prescriptions = parseBangyakFile(cleanContent);

    console.log(`   파싱 완료: ${prescriptions.length}개 처방`);

    // JSON 저장
    fs.writeFileSync(outputPath, JSON.stringify(prescriptions, null, 2), 'utf8');
    console.log(`   출력: ${outputPath}`);

    // ── 통계 ──
    const totalHerbs = prescriptions.reduce((sum, p) => sum + p.herbs.length, 0);
    const withMods = prescriptions.filter(p => p.modifications && p.modifications.length > 0);
    const totalMods = withMods.reduce((sum, p) => sum.concat(p.modifications), []);
    const withDosage = prescriptions.filter(p => p.dosageMethod);
    const withIndications = prescriptions.filter(p => p.indications);

    // 액션별 통계
    const actionCounts = {};
    for (const mod of totalMods) {
        for (const change of mod.changes) {
            actionCounts[change.action] = (actionCounts[change.action] || 0) + 1;
        }
    }

    console.log(`\n📊 통계:`);
    console.log(`   총 처방 수: ${prescriptions.length}`);
    console.log(`   총 약재 항목 수: ${totalHerbs}`);
    console.log(`   약재/처방 평균: ${(totalHerbs / prescriptions.length).toFixed(1)}개`);
    console.log(`   가감법 보유 처방: ${withMods.length}개`);
    console.log(`   가감법 총 항목: ${totalMods.length}개`);
    console.log(`   복용법 보유 처방: ${withDosage.length}개`);
    console.log(`   적응증 보유 처방: ${withIndications.length}개`);
    console.log(`   액션별 분류: ${JSON.stringify(actionCounts)}`);

    // ── 샘플 출력 ──
    // 지황음자를 찾아서 출력
    const sample = prescriptions.find(p => p.name.includes('지황음자')) || prescriptions[1];
    console.log(`\n📋 샘플 (${sample.name}):`);
    console.log(JSON.stringify(sample, null, 2));

    // 보중익기탕도 출력 (가감법 많은 처방)
    const sample2 = prescriptions.find(p => p.name.includes('보중익기탕'));
    if (sample2) {
        console.log(`\n📋 샘플2 (${sample2.name}):`);
        console.log(JSON.stringify(sample2, null, 2));
    }
}

main().catch(console.error);
