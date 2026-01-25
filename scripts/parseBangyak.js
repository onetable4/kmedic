/**
 * 방약합편 텍스트 파일을 JSON으로 파싱하는 스크립트
 * 
 * 사용법: node scripts/parseBangyak.js
 * 출력: public/bangyak-prescriptions.json
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import iconv from 'iconv-lite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 한자 → 한글 약재명 매핑 사전
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

    // ㄴ
    '牛膝': '우슬',
    '牛黃': '우황',
    '南星': '남성',
    '龍腦': '용뇌',

    // ㄷ
    '當歸': '당귀',
    '大棗': '대조',
    '大黃': '대황',
    '大腹皮': '대복피',
    '獨活': '독활',
    '杜冲': '두충',
    '丹參': '단삼',

    // ㄹ
    '龍眼肉': '용안육',
    '龍骨': '용골',
    '鹿茸': '녹용',
    '連翹': '연교',

    // ㅁ
    '麻黃': '마황',
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

    // ㅂ
    '半夏': '반하',
    '白芍藥': '백작약',
    '白朮': '백출',
    '白茯苓': '백복령',
    '白茯神': '백복신',
    '白芷': '백지',
    '白扁豆': '백편두',
    '附子': '부자',
    '防風': '방풍',
    '防己': '방기',
    '巴戟': '파극',
    '薄荷': '박하',
    '檳榔': '빈랑',
    '貝母': '패모',
    '便香附': '편향부',
    '蓬朮': '봉출',

    // ㅅ
    '砂仁': '사인',
    '縮砂': '축사',
    '蛇床子': '사상자',
    '山藥': '산약',
    '山茱萸': '산수유',
    '山査肉': '산사육',
    '酸棗仁': '산조인',
    '桑螵蛸': '상표소',
    '桑白皮': '상백피',
    '生薑': '생강',
    '生地黃': '생지황',
    '生乾地黃': '생건지황',
    '石膏': '석고',
    '石斛': '석곡',
    '石菖蒲': '석창포',
    '細辛': '세신',
    '蘇葉': '소엽',
    '續斷': '속단',
    '熟地黃': '숙지황',
    '升麻': '승마',
    '神麯': '신곡',
    '沈香': '침향',
    '犀角': '서각',

    // ㅇ
    '羊腎': '양신',
    '杏仁': '행인',
    '薏苡仁': '의이인',
    '益智仁': '익지인',
    '遠志': '원지',
    '五味子': '오미자',
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

    // ㅈ
    '紫蘇': '자소',
    '磁石': '자석',
    '芍藥': '작약',
    '全蝎': '전갈',
    '赤茯苓': '적복령',
    '梔子': '치자',
    '知母': '지모',
    '地骨皮': '지골피',
    '澤瀉': '택사',
    '竹瀝': '죽력',
    '枳實': '지실',
    '枳殼': '지각',
    '猪苓': '저령',
    '朱砂': '주사',
    '前胡': '전호',

    // ㅊ
    '川芎': '천궁',
    '川烏': '천오',
    '菖蒲': '창포',
    '蒼朮': '창출',
    '天麻': '천마',
    '天門冬': '천문동',
    '天南星': '천남성',
    '靑皮': '청피',
    '車前子': '차전자',
    '陳皮': '진피',
    '穿山甲': '천산갑',

    // ㅋ ㅌ
    '土茯苓': '토복령',

    // ㅍ
    '八珍': '팔진',
    '片芩': '편금',
    '茯苓': '복령',
    '茯神': '복신',

    // ㅎ
    '何首烏': '하수오',
    '荷葉': '하엽',
    '香附子': '향부자',
    '厚朴': '후박',
    '黃芪': '황기',
    '黃芩': '황금',
    '黃柏': '황백',
    '黃連': '황련',
    '花椒': '화초',
    '滑石': '활석',
    '荊芥': '형개',
    '紅花': '홍화',

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
};

// 숫자 변환 (한문 숫자 → 아라비아 숫자)
const HANJA_NUMBERS = {
    '一': 1, '二': 2, '三': 3, '四': 4, '五': 5,
    '六': 6, '七': 7, '八': 8, '九': 9, '十': 10,
    '百': 100, '千': 1000,
    '半': 0.5,
};

/**
 * 한자 약재명을 한글로 변환
 */
function hanjaToHangul(hanja) {
    // 직접 매핑 확인
    if (HANJA_TO_HANGUL[hanja]) {
        return HANJA_TO_HANGUL[hanja];
    }

    // 부분 매칭 시도 (예: 白芍藥酒炒 → 백작약)
    for (const [key, value] of Object.entries(HANJA_TO_HANGUL)) {
        if (hanja.includes(key)) {
            return value + ' (' + hanja.replace(key, '') + ')';
        }
    }

    // 매핑 없으면 원본 반환
    return hanja;
}

/**
 * 약재 라인 파싱 (예: "人蔘3 白朮3" → [{name: "인삼", amount: 3, unit: "g"}, ...])
 */
function parseHerbLine(line) {
    const herbs = [];

    // 정규식: 한자 약재명 + 숫자 (포함: 酒炒 같은 수치 방법)
    const pattern = /([^\d\s]+?)(\d+(?:\.\d+)?)/g;
    let match;

    while ((match = pattern.exec(line)) !== null) {
        const hanjaName = match[1].trim();
        const amount = parseFloat(match[2]);

        if (hanjaName && !isNaN(amount)) {
            herbs.push({
                name: hanjaToHangul(hanjaName),
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
    // 패턴: 上統/中統/下統 + 번호 + 처방명(한자명)
    const match = line.match(/^(上統|中統|下統)\s*(\d+)\s*(.+)$/);

    if (!match) return null;

    const category = match[1];
    const number = parseInt(match[2]);
    const namepart = match[3].trim();

    // 처방명에서 한글명과 한자명 분리
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

/**
 * 전체 파일 파싱
 */
function parseBangyakFile(content) {
    const lines = content.split('\n');
    const prescriptions = [];

    let currentPrescription = null;
    let currentSection = null; // 'header', 'herbs', 'description'

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        if (!line) {
            // 빈 줄은 섹션 구분
            if (currentPrescription && currentSection === 'herbs') {
                currentSection = 'description';
            }
            continue;
        }

        // 새 처방 시작 확인
        if (line.match(/^(上統|中統|下統)\s*\d+/)) {
            // 이전 처방 저장
            if (currentPrescription && currentPrescription.herbs.length > 0) {
                prescriptions.push(finalizePrescription(currentPrescription));
            }

            // 새 처방 시작
            const header = parseHeader(line);
            if (header) {
                currentPrescription = {
                    ...header,
                    herbs: [],
                    indication: '',
                    modification: '',
                    notes: ''
                };
                currentSection = 'herbs'; // 다음 줄은 약재
            }
            continue;
        }

        if (!currentPrescription) continue;

        // 약재 라인인지 확인 (한자 + 숫자 패턴)
        if (currentSection === 'herbs' && /^[^\s\[\]①②③④⑤].*\d+/.test(line) && !/다스린다|치료한다|용한다/.test(line)) {
            const herbs = parseHerbLine(line);
            currentPrescription.herbs.push(...herbs);
            continue;
        }

        // 설명 부분
        if (currentSection === 'description' || currentSection === 'herbs') {
            currentSection = 'description';

            // [活套], [適應症] 등 특수 섹션 확인
            if (line.includes('[活套]') || line.includes('[用法]')) {
                currentPrescription.modification += (currentPrescription.modification ? '\n' : '') + line;
            } else if (line.includes('[適應症]')) {
                currentPrescription.notes += (currentPrescription.notes ? '\n' : '') + line;
            } else if (line.startsWith('①') || line.startsWith('②') || line.startsWith('③') ||
                line.includes('① ') || line.includes('② ') || line.includes('③ ')) {
                // 가감법
                currentPrescription.modification += (currentPrescription.modification ? '\n' : '') + line;
            } else {
                // 주치 (첫 번째 일반 설명)
                if (!currentPrescription.indication) {
                    currentPrescription.indication = line;
                } else {
                    currentPrescription.modification += (currentPrescription.modification ? '\n' : '') + line;
                }
            }
        }
    }

    // 마지막 처방 저장
    if (currentPrescription && currentPrescription.herbs.length > 0) {
        prescriptions.push(finalizePrescription(currentPrescription));
    }

    return prescriptions;
}

/**
 * 처방 객체 최종 정리
 */
function finalizePrescription(raw) {
    const now = new Date().toISOString();

    return {
        id: `bangyak-${raw.category}-${raw.number}`,
        name: raw.name,
        herbs: raw.herbs,
        source: `방약합편 (${raw.category} ${raw.number})`,
        indication: raw.indication || undefined,
        effect: undefined,
        modification: raw.modification || undefined,
        notes: raw.hanjaName ? `한자명: ${raw.hanjaName}` + (raw.notes ? '\n' + raw.notes : '') : raw.notes || undefined,
        createdAt: now,
        updatedAt: now
    };
}

/**
 * 메인 함수
 */
async function main() {
    const inputPath = path.join(__dirname, '..', 'data', 'bangyak.txt');
    const outputPath = path.join(__dirname, '..', 'public', 'bangyak-prescriptions.json');

    console.log('📖 방약합편 파싱 시작...');
    console.log(`   입력: ${inputPath}`);

    // UTF-16LE 파일 읽기
    const buffer = fs.readFileSync(inputPath);
    const content = iconv.decode(buffer, 'UTF-16LE');

    // BOM 제거
    const cleanContent = content.replace(/^\uFEFF/, '');

    // 파싱
    const prescriptions = parseBangyakFile(cleanContent);

    console.log(`   파싱 완료: ${prescriptions.length}개 처방`);

    // JSON 저장
    fs.writeFileSync(outputPath, JSON.stringify(prescriptions, null, 2), 'utf8');
    console.log(`   출력: ${outputPath}`);

    // 통계 출력
    const totalHerbs = prescriptions.reduce((sum, p) => sum + p.herbs.length, 0);
    console.log(`\n📊 통계:`);
    console.log(`   - 총 처방 수: ${prescriptions.length}`);
    console.log(`   - 총 약재 항목 수: ${totalHerbs}`);
    console.log(`   - 약재/처방 평균: ${(totalHerbs / prescriptions.length).toFixed(1)}개`);

    // 샘플 출력
    console.log(`\n📋 샘플 (첫 번째 처방):`);
    console.log(JSON.stringify(prescriptions[0], null, 2));
}

main().catch(console.error);
