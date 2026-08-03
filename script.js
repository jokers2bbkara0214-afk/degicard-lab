"use strict";

const MAIN_DECK_LIMIT = 50;
const DEFAULT_CARD_LIMIT = 4;
const STORAGE_KEY = "digicardLabDeck";

const ANALYSIS_COLORS = [
    "赤",
    "青",
    "黄",
    "緑",
    "黒",
    "紫",
    "白"
];

const ANALYSIS_LEVELS = [2, 3, 4, 5, 6, 7];

let cards = [];
let deck = loadDeckFromStorage();
let activeModalCardId = null;
let toastTimer = null;

let radarChartInstance = null;
let scoreBarChartInstance = null;

/* カード図鑑 */

const searchInput =
    document.getElementById("searchInput");

const colorFilter =
    document.getElementById("colorFilter");

const typeFilter =
    document.getElementById("typeFilter");

const levelFilter =
    document.getElementById("levelFilter");

const cardList =
    document.getElementById("cardList");

const cardCount =
    document.getElementById("cardCount");

/* デッキ構築 */

const deckList =
    document.getElementById("deckList");

const deckSearchInput =
    document.getElementById("deckSearchInput");

const deckSortSelect =
    document.getElementById("deckSortSelect");

const clearDeckButton =
    document.getElementById("clearDeckButton");

const deckTotalCount =
    document.getElementById("deckTotalCount");

const uniqueCardCount =
    document.getElementById("uniqueCardCount");

const digimonCount =
    document.getElementById("digimonCount");

const supportCount =
    document.getElementById("supportCount");

const deckProgressBar =
    document.getElementById("deckProgressBar");

const deckStatusMessage =
    document.getElementById("deckStatusMessage");

const sidebarDeckCount =
    document.getElementById("sidebarDeckCount");

const homeDeckCount =
    document.getElementById("homeDeckCount");

const homeDeckProgress =
    document.getElementById("homeDeckProgress");

const homeDeckMessage =
    document.getElementById("homeDeckMessage");

/* 分析 */

const analysisEmpty =
    document.getElementById("analysisEmpty");

const analysisContent =
    document.getElementById("analysisContent");

const overallScore =
    document.getElementById("overallScore");

const overallRank =
    document.getElementById("overallRank");

const overallMessage =
    document.getElementById("overallMessage");

const analysisDeckTotal =
    document.getElementById("analysisDeckTotal");

const analysisDeckProgress =
    document.getElementById("analysisDeckProgress");

const analysisColorCount =
    document.getElementById("analysisColorCount");

const mainColorText =
    document.getElementById("mainColorText");

const analysisUniqueCount =
    document.getElementById("analysisUniqueCount");

const analysisDigimonRatio =
    document.getElementById("analysisDigimonRatio");

const levelBreakdown =
    document.getElementById("levelBreakdown");

const colorBreakdown =
    document.getElementById("colorBreakdown");

const typeBreakdown =
    document.getElementById("typeBreakdown");

const adviceList =
    document.getElementById("adviceList");

const adviceCount =
    document.getElementById("adviceCount");

const radarChartCanvas =
    document.getElementById("radarChart");

const scoreBarChartCanvas =
    document.getElementById("scoreBarChart");

/* 共通 */

const toast =
    document.getElementById("toast");

/* モーダル */

const cardModal =
    document.getElementById("cardModal");

const modalCloseButton =
    document.getElementById("modalCloseButton");

const modalCardImage =
    document.getElementById("modalCardImage");

const modalCardNumber =
    document.getElementById("modalCardNumber");

const modalCardName =
    document.getElementById("modalCardName");

const modalCardTags =
    document.getElementById("modalCardTags");

const modalPlayCost =
    document.getElementById("modalPlayCost");

const modalDp =
    document.getElementById("modalDp");

const modalForm =
    document.getElementById("modalForm");

const modalAttribute =
    document.getElementById("modalAttribute");

const modalRarity =
    document.getElementById("modalRarity");

const modalSet =
    document.getElementById("modalSet");

const modalDigivolutionCosts =
    document.getElementById(
        "modalDigivolutionCosts"
    );

const modalTraits =
    document.getElementById("modalTraits");

const modalEffect =
    document.getElementById("modalEffect");

const modalInheritedEffect =
    document.getElementById(
        "modalInheritedEffect"
    );

const modalSecurityEffect =
    document.getElementById(
        "modalSecurityEffect"
    );

const modalAddButton =
    document.getElementById("modalAddButton");

const modalRemoveButton =
    document.getElementById("modalRemoveButton");

const modalDeckQuantity =
    document.getElementById(
        "modalDeckQuantity"
    );

/* ページ切り替え */

function showPage(pageId) {
    document
        .querySelectorAll(".page")
        .forEach((page) => {
            page.classList.remove("active");
        });

    document
        .querySelectorAll(".nav-button")
        .forEach((button) => {
            button.classList.remove("active");
        });

    const targetPage =
        document.getElementById(pageId);

    const targetButton =
        document.querySelector(
            `.nav-button[data-page="${pageId}"]`
        );

    if (!targetPage) {
        console.error(
            `ページが見つかりません: ${pageId}`
        );

        return;
    }

    targetPage.classList.add("active");

    if (targetButton) {
        targetButton.classList.add("active");
    }

    if (pageId === "deck") {
        renderDeck();
    }

    if (pageId === "analysis") {
        renderAnalysis();
    }
}

/* カード読み込み */

async function loadCards() {
    try {
        const response =
            await fetch("./data/cards.json");

        if (!response.ok) {
            throw new Error(
                `カードデータ取得エラー: ${response.status}`
            );
        }

        const data =
            await response.json();

        if (!Array.isArray(data)) {
            throw new Error(
                "cards.jsonの形式が正しくありません。"
            );
        }

        cards = data;

        removeUnknownCardsFromDeck();
        renderCards(cards);
        updateAllDeckDisplays();

    } catch (error) {
        console.error(error);

        cardList.innerHTML = `
            <p class="empty-message">
                カードデータを読み込めませんでした。<br>
                XAMPP経由で開いてください。
            </p>
        `;
    }
}

/* カード図鑑 */

function renderCards(cardData) {
    cardCount.textContent =
        `${cardData.length}件`;

    if (cardData.length === 0) {
        cardList.innerHTML = `
            <p class="empty-message">
                条件に一致するカードがありません。
            </p>
        `;

        return;
    }

    cardList.innerHTML =
        cardData
            .map((card) => createCardHtml(card))
            .join("");
}

function createCardHtml(card) {
    const imageHtml =
        createCardImageHtml(
            card,
            "card-placeholder"
        );

    const colorTags =
        Array.isArray(card.colors)
            ? card.colors
                .map(
                    (color) => `
                        <span class="card-tag">
                            ${escapeHtml(color)}
                        </span>
                    `
                )
                .join("")
            : "";

    const levelText =
        hasValue(card.level)
            ? `Lv.${card.level}`
            : "レベルなし";

    const dpText =
        hasValue(card.dp)
            ? `${Number(card.dp).toLocaleString()} DP`
            : "DPなし";

    const deckQuantity =
        getDeckQuantity(card.id);

    return `
        <article
            class="digimon-card"
            data-card-id="${escapeHtml(card.id)}"
            tabindex="0"
            role="button"
            aria-label="${escapeHtml(card.name)}の詳細を開く"
        >

            <button
                class="card-add-button"
                type="button"
                data-add-card="${escapeHtml(card.id)}"
                aria-label="${escapeHtml(card.name)}をデッキに追加"
            >
                ＋
            </button>

            ${
                deckQuantity > 0
                    ? `
                        <span class="card-deck-count">
                            ${deckQuantity}枚
                        </span>
                    `
                    : ""
            }

            <div class="card-image">
                ${imageHtml}
            </div>

            <div class="card-info">

                <p class="card-number">
                    ${escapeHtml(card.id)}
                </p>

                <h2 class="card-name">
                    ${escapeHtml(card.name)}
                </h2>

                <div class="card-tags">

                    ${colorTags}

                    <span class="card-tag">
                        ${escapeHtml(card.cardType)}
                    </span>

                    <span class="card-tag">
                        ${levelText}
                    </span>

                </div>

                <div class="card-stats">

                    <span>
                        登場コスト：
                        ${card.playCost ?? "-"}
                    </span>

                    <span>
                        ${dpText}
                    </span>

                    <span>
                        レアリティ：
                        ${escapeHtml(card.rarity || "-")}
                    </span>

                    <span>
                        収録：
                        ${escapeHtml(card.set || "-")}
                    </span>

                </div>

            </div>

        </article>
    `;
}

function filterCards() {
    const keyword =
        searchInput.value
            .trim()
            .toLowerCase();

    const selectedColor =
        colorFilter.value;

    const selectedType =
        typeFilter.value;

    const selectedLevel =
        levelFilter.value;

    const filteredCards =
        cards.filter((card) => {
            const name =
                String(card.name || "")
                    .toLowerCase();

            const id =
                String(card.id || "")
                    .toLowerCase();

            const matchesKeyword =
                name.includes(keyword) ||
                id.includes(keyword);

            const matchesColor =
                selectedColor === "" ||
                (
                    Array.isArray(card.colors) &&
                    card.colors.includes(
                        selectedColor
                    )
                );

            const matchesType =
                selectedType === "" ||
                card.cardType === selectedType;

            const matchesLevel =
                selectedLevel === "" ||
                String(card.level) ===
                    selectedLevel;

            return (
                matchesKeyword &&
                matchesColor &&
                matchesType &&
                matchesLevel
            );
        });

    renderCards(filteredCards);
}

/* デッキ操作 */

function addCardToDeck(cardId) {
    const card =
        findCard(cardId);

    if (!card) {
        showToast(
            "カードが見つかりませんでした。",
            true
        );

        return;
    }

    if (
        card.isDigiEgg ||
        card.cardType === "デジタマ"
    ) {
        showToast(
            "デジタマデッキは次の段階で実装します。",
            true
        );

        return;
    }

    const total =
        getDeckTotal();

    if (total >= MAIN_DECK_LIMIT) {
        showToast(
            "メインデッキは50枚までです。",
            true
        );

        return;
    }

    const currentQuantity =
        getDeckQuantity(cardId);

    const cardLimit =
        Number(
            card.deckLimit ??
            DEFAULT_CARD_LIMIT
        );

    if (currentQuantity >= cardLimit) {
        showToast(
            `${card.name}は${cardLimit}枚までです。`,
            true
        );

        return;
    }

    deck[cardId] =
        currentQuantity + 1;

    saveDeck();
    updateAllDeckDisplays();

    showToast(
        `${card.name}をデッキに追加しました。`
    );
}

function removeOneCardFromDeck(cardId) {
    const currentQuantity =
        getDeckQuantity(cardId);

    if (currentQuantity <= 0) {
        return;
    }

    if (currentQuantity === 1) {
        delete deck[cardId];
    } else {
        deck[cardId] =
            currentQuantity - 1;
    }

    saveDeck();
    updateAllDeckDisplays();
}

function removeCardCompletely(cardId) {
    const card =
        findCard(cardId);

    if (!deck[cardId]) {
        return;
    }

    delete deck[cardId];

    saveDeck();
    updateAllDeckDisplays();

    showToast(
        `${card?.name || "カード"}をデッキから削除しました。`
    );
}

function clearDeck() {
    if (getDeckTotal() === 0) {
        showToast(
            "デッキはすでに空です。"
        );

        return;
    }

    const confirmed =
        window.confirm(
            "デッキのカードをすべて削除しますか？"
        );

    if (!confirmed) {
        return;
    }

    deck = {};

    saveDeck();
    updateAllDeckDisplays();

    showToast(
        "デッキを空にしました。"
    );
}

/* デッキ表示 */

function renderDeck() {
    const keyword =
        deckSearchInput.value
            .trim()
            .toLowerCase();

    const sortType =
        deckSortSelect.value;

    let deckCards =
        getDeckCardEntries()
            .filter(({ card }) => {
                const name =
                    String(card.name || "")
                        .toLowerCase();

                const id =
                    String(card.id || "")
                        .toLowerCase();

                return (
                    name.includes(keyword) ||
                    id.includes(keyword)
                );
            });

    deckCards =
        sortDeckCards(
            deckCards,
            sortType
        );

    if (deckCards.length === 0) {
        deckList.innerHTML = `
            <p class="empty-message">
                ${
                    getDeckTotal() === 0
                        ? `
                            まだカードが追加されていません。<br>
                            カード図鑑から追加してみましょう。
                        `
                        : `
                            検索条件に一致するカードがありません。
                        `
                }
            </p>
        `;

        return;
    }

    deckList.innerHTML =
        deckCards
            .map(
                ({ card, quantity }) =>
                    createDeckItemHtml(
                        card,
                        quantity
                    )
            )
            .join("");
}

function createDeckItemHtml(
    card,
    quantity
) {
    const imageHtml =
        createCardImageHtml(
            card,
            "card-placeholder"
        );

    const colors =
        Array.isArray(card.colors)
            ? card.colors.join(" / ")
            : "-";

    const levelText =
        hasValue(card.level)
            ? `Lv.${card.level}`
            : "レベルなし";

    return `
        <article class="deck-item">

            <div class="deck-item-image">
                ${imageHtml}
            </div>

            <div class="deck-item-info">

                <p>
                    ${escapeHtml(card.id)}
                </p>

                <h3>
                    ${escapeHtml(card.name)}
                </h3>

                <p>
                    ${escapeHtml(colors)}
                    ・
                    ${escapeHtml(card.cardType)}
                    ・
                    ${levelText}
                </p>

            </div>

            <div class="deck-item-tags">

                <span class="card-tag">
                    登場コスト
                    ${card.playCost ?? "-"}
                </span>

                <span class="card-tag">

                    ${
                        hasValue(card.dp)
                            ? `
                                ${Number(card.dp).toLocaleString()}
                                DP
                            `
                            : "DPなし"
                    }

                </span>

                <span class="card-tag">
                    上限
                    ${card.deckLimit ?? DEFAULT_CARD_LIMIT}
                    枚
                </span>

            </div>

            <div class="quantity-control">

                <button
                    class="quantity-button"
                    type="button"
                    data-decrease-card="${escapeHtml(card.id)}"
                    aria-label="${escapeHtml(card.name)}を1枚減らす"
                >
                    −
                </button>

                <strong>
                    ${quantity}枚
                </strong>

                <button
                    class="quantity-button"
                    type="button"
                    data-increase-card="${escapeHtml(card.id)}"
                    aria-label="${escapeHtml(card.name)}を1枚増やす"
                >
                    ＋
                </button>

                <button
                    class="remove-card-button"
                    type="button"
                    data-remove-card="${escapeHtml(card.id)}"
                >
                    削除
                </button>

            </div>

        </article>
    `;
}

function sortDeckCards(
    deckCards,
    sortType
) {
    return [...deckCards]
        .sort((a, b) => {
            if (sortType === "name") {
                return a.card.name.localeCompare(
                    b.card.name,
                    "ja"
                );
            }

            if (sortType === "count") {
                return (
                    b.quantity -
                    a.quantity ||
                    a.card.name.localeCompare(
                        b.card.name,
                        "ja"
                    )
                );
            }

            if (sortType === "number") {
                return a.card.id.localeCompare(
                    b.card.id
                );
            }

            const levelA =
                hasValue(a.card.level)
                    ? Number(a.card.level)
                    : 99;

            const levelB =
                hasValue(b.card.level)
                    ? Number(b.card.level)
                    : 99;

            return (
                levelA -
                levelB ||
                a.card.name.localeCompare(
                    b.card.name,
                    "ja"
                )
            );
        });
}

/* デッキ集計 */

function updateAllDeckDisplays() {
    const total =
        getDeckTotal();

    const percentage =
        Math.min(
            (
                total /
                MAIN_DECK_LIMIT
            ) * 100,
            100
        );

    const uniqueCount =
        Object.keys(deck).length;

    const digimonTotal =
        getDeckTypeCount("デジモン");

    const supportTotal =
        getDeckTypeCount("テイマー") +
        getDeckTypeCount("オプション");

    sidebarDeckCount.textContent =
        total;

    homeDeckCount.textContent =
        `${total} / ${MAIN_DECK_LIMIT}`;

    deckTotalCount.textContent =
        `${total} / ${MAIN_DECK_LIMIT}`;

    homeDeckProgress.style.width =
        `${percentage}%`;

    deckProgressBar.style.width =
        `${percentage}%`;

    uniqueCardCount.textContent =
        `${uniqueCount}種類`;

    digimonCount.textContent =
        `${digimonTotal}枚`;

    supportCount.textContent =
        `${supportTotal}枚`;

    if (total === 0) {
        homeDeckMessage.textContent =
            "カードを追加してみましょう";

        deckStatusMessage.textContent =
            "あと50枚追加できます";

    } else if (total < MAIN_DECK_LIMIT) {
        const remaining =
            MAIN_DECK_LIMIT - total;

        homeDeckMessage.textContent =
            `あと${remaining}枚で完成`;

        deckStatusMessage.textContent =
            `あと${remaining}枚追加できます`;

    } else {
        homeDeckMessage.textContent =
            "50枚のデッキが完成しました";

        deckStatusMessage.textContent =
            "メインデッキが完成しました";
    }

    filterCards();
    renderDeck();
    renderAnalysis();
    updateModalDeckQuantity();
}

function getDeckCardEntries() {
    return Object.entries(deck)
        .map(([cardId, quantity]) => {
            const card =
                findCard(cardId);

            if (!card) {
                return null;
            }

            return {
                card,
                quantity: Number(quantity)
            };
        })
        .filter(Boolean);
}

function getDeckTotal() {
    return Object.values(deck)
        .reduce(
            (total, quantity) =>
                total + Number(quantity),
            0
        );
}

function getDeckQuantity(cardId) {
    return Number(
        deck[cardId] || 0
    );
}

function getDeckTypeCount(cardType) {
    return getDeckCardEntries()
        .reduce(
            (
                total,
                { card, quantity }
            ) => {
                if (
                    card.cardType ===
                    cardType
                ) {
                    return (
                        total +
                        quantity
                    );
                }

                return total;
            },
            0
        );
}

/* デッキ分析 */

function renderAnalysis() {
    if (
        !analysisEmpty ||
        !analysisContent
    ) {
        return;
    }

    const total =
        getDeckTotal();

    if (total === 0) {
        analysisEmpty.hidden = false;
        analysisContent.hidden = true;

        destroyAnalysisCharts();

        return;
    }

    analysisEmpty.hidden = true;
    analysisContent.hidden = false;

    const analysis =
        calculateDeckAnalysis();

    updateAnalysisSummary(analysis);

    renderBreakdown(
        levelBreakdown,
        analysis.levelCounts,
        analysis.levelLabels,
        total
    );

    renderBreakdown(
        colorBreakdown,
        analysis.colorCounts,
        ANALYSIS_COLORS,
        Math.max(
            total,
            analysis.totalColorEntries
        )
    );

    renderBreakdown(
        typeBreakdown,
        analysis.typeCounts,
        [
            "デジモン",
            "テイマー",
            "オプション"
        ],
        total
    );

    renderAdvice(
        analysis.advice
    );

    renderAnalysisCharts(
        analysis.scores
    );
}

function calculateDeckAnalysis() {
    const entries =
        getDeckCardEntries();

    const total =
        getDeckTotal();

    const levelCounts = {};

    ANALYSIS_LEVELS.forEach((level) => {
        levelCounts[level] = 0;
    });

    const colorCounts = {};

    ANALYSIS_COLORS.forEach((color) => {
        colorCounts[color] = 0;
    });

    const typeCounts = {
        "デジモン": 0,
        "テイマー": 0,
        "オプション": 0
    };

    let totalPlayCost = 0;
    let playCostCardCount = 0;
    let totalDp = 0;
    let dpCardCount = 0;

    entries.forEach(
        ({ card, quantity }) => {
            if (
                hasValue(card.level) &&
                Object.hasOwn(
                    levelCounts,
                    Number(card.level)
                )
            ) {
                levelCounts[
                    Number(card.level)
                ] += quantity;
            }

            if (
                Array.isArray(card.colors)
            ) {
                card.colors.forEach(
                    (color) => {
                        if (
                            Object.hasOwn(
                                colorCounts,
                                color
                            )
                        ) {
                            colorCounts[color] +=
                                quantity;
                        }
                    }
                );
            }

            if (
                Object.hasOwn(
                    typeCounts,
                    card.cardType
                )
            ) {
                typeCounts[
                    card.cardType
                ] += quantity;
            }

            if (hasValue(card.playCost)) {
                totalPlayCost +=
                    Number(card.playCost) *
                    quantity;

                playCostCardCount +=
                    quantity;
            }

            if (hasValue(card.dp)) {
                totalDp +=
                    Number(card.dp) *
                    quantity;

                dpCardCount +=
                    quantity;
            }
        }
    );

    const totalColorEntries =
        Object.values(colorCounts)
            .reduce(
                (sum, count) =>
                    sum + count,
                0
            );

    const usedColors =
        ANALYSIS_COLORS
            .filter(
                (color) =>
                    colorCounts[color] > 0
            );

    const mainColor =
        [...ANALYSIS_COLORS]
            .sort(
                (a, b) =>
                    colorCounts[b] -
                    colorCounts[a]
            )[0];

    const averagePlayCost =
        playCostCardCount > 0
            ? totalPlayCost /
                playCostCardCount
            : 0;

    const averageDp =
        dpCardCount > 0
            ? totalDp /
                dpCardCount
            : 0;

    const scores =
        calculateDeckScores({
            total,
            levelCounts,
            typeCounts,
            usedColors,
            averagePlayCost,
            averageDp
        });

    const scoreValues =
        Object.values(scores);

    const overall =
        clampScore(
            Math.round(
                scoreValues.reduce(
                    (sum, value) =>
                        sum + value,
                    0
                ) /
                scoreValues.length
            )
        );

    const rank =
        getScoreRank(overall);

    const advice =
        createDeckAdvice({
            total,
            levelCounts,
            typeCounts,
            usedColors,
            scores
        });

    return {
        total,
        uniqueCount:
            Object.keys(deck).length,
        levelCounts,
        levelLabels:
            ANALYSIS_LEVELS,
        colorCounts,
        typeCounts,
        usedColors,
        mainColor:
            usedColors.length > 0
                ? mainColor
                : null,
        totalColorEntries,
        averagePlayCost,
        averageDp,
        scores,
        overall,
        rank,
        advice
    };
}

function calculateDeckScores({
    total,
    levelCounts,
    typeCounts,
    usedColors,
    averagePlayCost,
    averageDp
}) {
    const completionScore =
        Math.min(
            total / MAIN_DECK_LIMIT,
            1
        ) * 100;

    const level3 =
        levelCounts[3] || 0;

    const level4 =
        levelCounts[4] || 0;

    const level5 =
        levelCounts[5] || 0;

    const level6 =
        levelCounts[6] || 0;

    const level7 =
        levelCounts[7] || 0;

    const digimon =
        typeCounts["デジモン"] || 0;

    const tamers =
        typeCounts["テイマー"] || 0;

    const options =
        typeCounts["オプション"] || 0;

    const lowLevelFoundation =
        scoreTargetRange(
            level3,
            10,
            16
        );

    const midLevelBalance =
        (
            scoreTargetRange(
                level4,
                8,
                13
            ) +
            scoreTargetRange(
                level5,
                6,
                10
            )
        ) / 2;

    const highLevelBalance =
        scoreTargetRange(
            level6 + level7,
            4,
            10
        );

    const supportBalance =
        scoreTargetRange(
            tamers + options,
            4,
            14
        );

    const colorSimplicity =
        usedColors.length === 0
            ? 0
            : usedColors.length === 1
                ? 100
                : usedColors.length === 2
                    ? 86
                    : usedColors.length === 3
                        ? 66
                        : 45;

    const costScore =
        averagePlayCost === 0
            ? 50
            : averagePlayCost <= 5
                ? 88
                : averagePlayCost <= 7
                    ? 72
                    : 55;

    const dpScore =
        averageDp === 0
            ? 45
            : Math.min(
                100,
                45 +
                averageDp / 180
            );

    const stability =
        clampScore(
            completionScore * 0.25 +
            lowLevelFoundation * 0.35 +
            midLevelBalance * 0.25 +
            colorSimplicity * 0.15
        );

    const development =
        clampScore(
            completionScore * 0.2 +
            lowLevelFoundation * 0.3 +
            midLevelBalance * 0.3 +
            costScore * 0.2
        );

    const attack =
        clampScore(
            completionScore * 0.15 +
            highLevelBalance * 0.35 +
            dpScore * 0.35 +
            midLevelBalance * 0.15
        );

    const defense =
        clampScore(
            completionScore * 0.2 +
            supportBalance * 0.35 +
            midLevelBalance * 0.25 +
            colorSimplicity * 0.2
        );

    const beginnerFriendly =
        clampScore(
            completionScore * 0.15 +
            lowLevelFoundation * 0.3 +
            midLevelBalance * 0.2 +
            colorSimplicity * 0.25 +
            (
                digimon > 0
                    ? 100
                    : 0
            ) * 0.1
        );

    return {
        stability:
            Math.round(stability),
        development:
            Math.round(development),
        attack:
            Math.round(attack),
        defense:
            Math.round(defense),
        beginnerFriendly:
            Math.round(
                beginnerFriendly
            )
    };
}

function scoreTargetRange(
    value,
    minimum,
    maximum
) {
    if (value >= minimum &&
        value <= maximum) {
        return 100;
    }

    if (value < minimum) {
        if (minimum === 0) {
            return 100;
        }

        return clampScore(
            (
                value /
                minimum
            ) * 100
        );
    }

    const excess =
        value - maximum;

    return clampScore(
        100 -
        excess * 12
    );
}

function createDeckAdvice({
    total,
    levelCounts,
    typeCounts,
    usedColors,
    scores
}) {
    const advice = [];

    const level3 =
        levelCounts[3] || 0;

    const level4 =
        levelCounts[4] || 0;

    const level5 =
        levelCounts[5] || 0;

    const level6 =
        levelCounts[6] || 0;

    const level7 =
        levelCounts[7] || 0;

    const tamers =
        typeCounts["テイマー"] || 0;

    const options =
        typeCounts["オプション"] || 0;

    if (total < MAIN_DECK_LIMIT) {
        advice.push({
            type: "info",
            icon: "🃏",
            title:
                `デッキはあと${MAIN_DECK_LIMIT - total}枚必要です`,
            message:
                "50枚になるまでは診断結果が大きく変化します。まずは使いたいデジモンの進化ラインを中心にカードを追加しましょう。"
        });
    } else {
        advice.push({
            type: "success",
            icon: "✅",
            title:
                "メインデッキが50枚になっています",
            message:
                "必要な枚数までカードがそろいました。次はレベル構成やカード同士の相性を確認しましょう。"
        });
    }

    if (level3 < 10) {
        advice.push({
            type: "danger",
            icon: "🌱",
            title:
                "Lv.3が少なめです",
            message:
                "Lv.3は進化の土台になります。少ないと序盤に進化を始められない可能性があります。まずは10枚以上を目安に増やしてみましょう。"
        });

    } else if (level3 > 16) {
        advice.push({
            type: "warning",
            icon: "⚖️",
            title:
                "Lv.3が多めです",
            message:
                "序盤は動きやすくなりますが、高レベルへ進化するカードが不足する可能性があります。Lv.4以上との割合を確認しましょう。"
        });

    } else {
        advice.push({
            type: "success",
            icon: "🌱",
            title:
                "Lv.3の枚数は安定しています",
            message:
                "進化を始めるための土台が確保されています。次はLv.4とLv.5のつながりを確認すると、さらに動きやすくなります。"
        });
    }

    if (level4 < 8) {
        advice.push({
            type: "warning",
            icon: "🧩",
            title:
                "Lv.4が少なめです",
            message:
                "Lv.3からLv.5へつなぐ途中のカードが不足しています。進化が途中で止まらないよう、Lv.4を追加してみましょう。"
        });
    }

    if (level5 < 6) {
        advice.push({
            type: "warning",
            icon: "🔗",
            title:
                "Lv.5が少なめです",
            message:
                "Lv.6へ進化するための中継地点が少なくなっています。切り札へ到達しやすくするため、Lv.5を増やす方法があります。"
        });
    }

    if (
        level6 + level7 >
        level4 + level5
    ) {
        advice.push({
            type: "danger",
            icon: "🏔️",
            title:
                "高レベルカードの割合が高めです",
            message:
                "強力なカードが多くても、進化途中のカードが不足すると手札で動けなくなる場合があります。Lv.4やLv.5とのバランスを見直しましょう。"
        });
    }

    if (tamers === 0) {
        advice.push({
            type: "info",
            icon: "👤",
            title:
                "テイマーカードがありません",
            message:
                "テイマーは必須ではありませんが、継続的に効果を使えるカードがあります。デッキの狙いに合うカードがあるか確認してみましょう。"
        });
    }

    if (options > 14) {
        advice.push({
            type: "warning",
            icon: "⚡",
            title:
                "オプションカードが多めです",
            message:
                "使いたい場面では強力ですが、デジモンが少なくなると進化しにくくなる可能性があります。役割が重なっているカードがないか確認しましょう。"
        });
    }

    if (usedColors.length >= 3) {
        advice.push({
            type: "warning",
            icon: "🎨",
            title:
                `${usedColors.length}色が使われています`,
            message:
                "色が増えるほど組み合わせは広がりますが、初心者には色条件の管理が難しくなる場合があります。まずは1〜2色に絞ると動きを覚えやすくなります。"
        });

    } else if (usedColors.length === 1) {
        advice.push({
            type: "success",
            icon: "🎨",
            title:
                "色が1色にまとまっています",
            message:
                "色条件を管理しやすく、初心者でもカードを使うタイミングを覚えやすい構成です。"
        });
    }

    if (
        scores.stability >= 80 &&
        scores.beginnerFriendly >= 80
    ) {
        advice.push({
            type: "success",
            icon: "⭐",
            title:
                "初心者でも扱いやすい構成です",
            message:
                "レベル構成と色のまとまりが比較的安定しています。今後はカード効果同士の相性を確認して、デッキの狙いを強めていきましょう。"
        });
    }

    return advice.slice(0, 8);
}

function updateAnalysisSummary(
    analysis
) {
    const percentage =
        Math.min(
            (
                analysis.total /
                MAIN_DECK_LIMIT
            ) * 100,
            100
        );

    overallScore.textContent =
        analysis.overall;

    overallRank.textContent =
        analysis.rank;

    overallMessage.textContent =
        getOverallMessage(
            analysis.overall
        );

    analysisDeckTotal.textContent =
        `${analysis.total} / ${MAIN_DECK_LIMIT}`;

    analysisDeckProgress.style.width =
        `${percentage}%`;

    analysisColorCount.textContent =
        `${analysis.usedColors.length}色`;

    mainColorText.textContent =
        analysis.mainColor
            ? `中心色：${analysis.mainColor}`
            : "メインカラーなし";

    analysisUniqueCount.textContent =
        `${analysis.uniqueCount}種類`;

    const digimonRatio =
        analysis.total > 0
            ? Math.round(
                (
                    analysis.typeCounts[
                        "デジモン"
                    ] /
                    analysis.total
                ) * 100
            )
            : 0;

    analysisDigimonRatio.textContent =
        `デジモン ${digimonRatio}%`;

    applyRankAppearance(
        analysis.rank
    );
}

function applyRankAppearance(rank) {
    const rankStyles = {
        SS: {
            background:
                "#7c3aed",
            borderColor:
                "#bc8cff"
        },

        S: {
            background:
                "#1f6feb",
            borderColor:
                "#58a6ff"
        },

        A: {
            background:
                "#238636",
            borderColor:
                "#3fb950"
        },

        B: {
            background:
                "#9e6a03",
            borderColor:
                "#d29922"
        },

        C: {
            background:
                "#6e7681",
            borderColor:
                "#8b949e"
        }
    };

    const style =
        rankStyles[rank] ||
        rankStyles.C;

    overallRank.style.background =
        style.background;

    overallRank.style.borderColor =
        style.borderColor;
}

function getScoreRank(score) {
    if (score >= 95) {
        return "SS";
    }

    if (score >= 85) {
        return "S";
    }

    if (score >= 70) {
        return "A";
    }

    if (score >= 50) {
        return "B";
    }

    return "C";
}

function getOverallMessage(score) {
    if (score >= 95) {
        return "構成のまとまりが非常に良好です。";
    }

    if (score >= 85) {
        return "安定した構成に近づいています。";
    }

    if (score >= 70) {
        return "基本的なバランスが整っています。";
    }

    if (score >= 50) {
        return "改善できる部分がいくつかあります。";
    }

    return "カードを追加しながら構成を育てましょう。";
}

function renderBreakdown(
    container,
    counts,
    labels,
    comparisonTotal
) {
    const visibleLabels =
        labels.filter(
            (label) =>
                Number(counts[label] || 0) > 0
        );

    if (visibleLabels.length === 0) {
        container.innerHTML = `
            <p class="breakdown-empty">
                該当するカードがありません
            </p>
        `;

        return;
    }

    const highest =
        Math.max(
            ...visibleLabels.map(
                (label) =>
                    Number(
                        counts[label] || 0
                    )
            ),
            1
        );

    container.innerHTML =
        visibleLabels
            .map((label) => {
                const value =
                    Number(
                        counts[label] || 0
                    );

                const width =
                    Math.min(
                        (
                            value /
                            highest
                        ) * 100,
                        100
                    );

                const percentage =
                    comparisonTotal > 0
                        ? Math.round(
                            (
                                value /
                                comparisonTotal
                            ) * 100
                        )
                        : 0;

                const displayLabel =
                    typeof label === "number"
                        ? `Lv.${label}`
                        : label;

                return `
                    <div class="breakdown-row">

                        <span class="breakdown-label">
                            ${escapeHtml(displayLabel)}
                        </span>

                        <div
                            class="breakdown-track"
                            title="${value}枚・${percentage}%"
                        >

                            <div
                                class="breakdown-bar"
                                style="width: ${width}%"
                            ></div>

                        </div>

                        <span class="breakdown-value">
                            ${value}枚
                        </span>

                    </div>
                `;
            })
            .join("");
}

function renderAdvice(advice) {
    adviceCount.textContent =
        `${advice.length}件`;

    if (advice.length === 0) {
        adviceList.innerHTML = `
            <div class="advice-item success">

                <div class="advice-icon">
                    ✅
                </div>

                <div>

                    <h3>
                        大きな問題は見つかりませんでした
                    </h3>

                    <p>
                        次はカード効果同士の相性を確認しましょう。
                    </p>

                </div>

            </div>
        `;

        return;
    }

    adviceList.innerHTML =
        advice
            .map(
                (item) => `
                    <article
                        class="advice-item ${escapeHtml(item.type)}"
                    >

                        <div class="advice-icon">
                            ${escapeHtml(item.icon)}
                        </div>

                        <div>

                            <h3>
                                ${escapeHtml(item.title)}
                            </h3>

                            <p>
                                ${escapeHtml(item.message)}
                            </p>

                        </div>

                    </article>
                `
            )
            .join("");
}

function renderAnalysisCharts(
    scores
) {
    if (
        typeof Chart === "undefined"
    ) {
        console.error(
            "Chart.jsを読み込めませんでした。"
        );

        return;
    }

    destroyAnalysisCharts();

    const labels = [
        "安定性",
        "展開力",
        "攻撃力",
        "防御力",
        "初心者向け"
    ];

    const values = [
        scores.stability,
        scores.development,
        scores.attack,
        scores.defense,
        scores.beginnerFriendly
    ];

    const commonFont = {
        family:
            '"Yu Gothic UI", "Meiryo", sans-serif'
    };

    radarChartInstance =
        new Chart(
            radarChartCanvas,
            {
                type: "radar",

                data: {
                    labels,

                    datasets: [
                        {
                            label:
                                "デッキ性能",

                            data:
                                values,

                            borderWidth:
                                2,

                            pointRadius:
                                4,

                            pointHoverRadius:
                                6,

                            borderColor:
                                "#58a6ff",

                            backgroundColor:
                                "rgba(88, 166, 255, 0.18)",

                            pointBackgroundColor:
                                "#58a6ff",

                            pointBorderColor:
                                "#f0f6fc"
                        }
                    ]
                },

                options: {
                    responsive: true,
                    maintainAspectRatio: false,

                    animation: {
                        duration: 450
                    },

                    plugins: {
                        legend: {
                            labels: {
                                color:
                                    "#c9d1d9",

                                font:
                                    commonFont
                            }
                        },

                        tooltip: {
                            callbacks: {
                                label(context) {
                                    return (
                                        `${context.label}: ` +
                                        `${context.raw}点`
                                    );
                                }
                            }
                        }
                    },

                    scales: {
                        r: {
                            min: 0,
                            max: 100,

                            ticks: {
                                stepSize: 20,
                                display: false
                            },

                            grid: {
                                color:
                                    "rgba(139, 148, 158, 0.25)"
                            },

                            angleLines: {
                                color:
                                    "rgba(139, 148, 158, 0.25)"
                            },

                            pointLabels: {
                                color:
                                    "#f0f6fc",

                                font: {
                                    ...commonFont,
                                    size: 12
                                }
                            }
                        }
                    }
                }
            }
        );

    scoreBarChartInstance =
        new Chart(
            scoreBarChartCanvas,
            {
                type: "bar",

                data: {
                    labels,

                    datasets: [
                        {
                            label:
                                "スコア",

                            data:
                                values,

                            borderWidth:
                                1,

                            borderRadius:
                                7,

                            borderSkipped:
                                false,

                            backgroundColor:
                                "rgba(88, 166, 255, 0.72)",

                            borderColor:
                                "#58a6ff"
                        }
                    ]
                },

                options: {
                    indexAxis: "y",
                    responsive: true,
                    maintainAspectRatio: false,

                    animation: {
                        duration: 450
                    },

                    plugins: {
                        legend: {
                            display: false
                        },

                        tooltip: {
                            callbacks: {
                                label(context) {
                                    return (
                                        `${context.raw}点`
                                    );
                                }
                            }
                        }
                    },

                    scales: {
                        x: {
                            min: 0,
                            max: 100,

                            ticks: {
                                color:
                                    "#8b949e",

                                font:
                                    commonFont
                            },

                            grid: {
                                color:
                                    "rgba(139, 148, 158, 0.13)"
                            }
                        },

                        y: {
                            ticks: {
                                color:
                                    "#f0f6fc",

                                font:
                                    commonFont
                            },

                            grid: {
                                display: false
                            }
                        }
                    }
                }
            }
        );
}

function destroyAnalysisCharts() {
    if (radarChartInstance) {
        radarChartInstance.destroy();
        radarChartInstance = null;
    }

    if (scoreBarChartInstance) {
        scoreBarChartInstance.destroy();
        scoreBarChartInstance = null;
    }
}

/* モーダル */

function openCardModal(cardId) {
    const card =
        findCard(cardId);

    if (!card) {
        console.error(
            `カードが見つかりません: ${cardId}`
        );

        return;
    }

    activeModalCardId =
        cardId;

    modalCardNumber.textContent =
        card.id || "-";

    modalCardName.textContent =
        card.name || "カード名なし";

    modalPlayCost.textContent =
        card.playCost ?? "-";

    modalDp.textContent =
        hasValue(card.dp)
            ? `${Number(card.dp).toLocaleString()} DP`
            : "-";

    modalForm.textContent =
        card.form || "-";

    modalAttribute.textContent =
        card.attribute || "-";

    modalRarity.textContent =
        card.rarity || "-";

    modalSet.textContent =
        card.set || "-";

    modalTraits.textContent =
        Array.isArray(card.traits) &&
        card.traits.length > 0
            ? card.traits.join(" / ")
            : "記載なし";

    modalEffect.textContent =
        card.effect?.trim()
            ? card.effect
            : "効果なし";

    modalInheritedEffect.textContent =
        card.inheritedEffect?.trim()
            ? card.inheritedEffect
            : "進化元効果なし";

    modalSecurityEffect.textContent =
        card.securityEffect?.trim()
            ? card.securityEffect
            : "セキュリティ効果なし";

    const colors =
        Array.isArray(card.colors)
            ? card.colors
            : [];

    const levelTag =
        hasValue(card.level)
            ? `
                <span class="card-tag">
                    Lv.${escapeHtml(card.level)}
                </span>
            `
            : "";

    modalCardTags.innerHTML = `
        ${colors
            .map(
                (color) => `
                    <span class="card-tag">
                        ${escapeHtml(color)}
                    </span>
                `
            )
            .join("")}

        <span class="card-tag">
            ${escapeHtml(card.cardType || "-")}
        </span>

        ${levelTag}
    `;

    modalCardImage.innerHTML =
        createCardImageHtml(
            card,
            "card-placeholder"
        );

    const costs =
        Array.isArray(
            card.digivolutionCosts
        )
            ? card.digivolutionCosts
            : [];

    if (costs.length === 0) {
        modalDigivolutionCosts.innerHTML =
            "<p>進化条件なし</p>";

    } else {
        modalDigivolutionCosts.innerHTML =
            costs
                .map(
                    (cost) => `
                        <span class="digivolution-cost">
                            ${escapeHtml(cost.color || "-")}
                            Lv.${escapeHtml(cost.level ?? "-")}
                            から
                            コスト${escapeHtml(cost.cost ?? "-")}
                        </span>
                    `
                )
                .join("");
    }

    updateModalDeckQuantity();

    cardModal.classList.add("open");

    cardModal.setAttribute(
        "aria-hidden",
        "false"
    );

    document.body.classList.add(
        "modal-open"
    );

    modalCloseButton.focus();
}

function closeCardModal() {
    cardModal.classList.remove("open");

    cardModal.setAttribute(
        "aria-hidden",
        "true"
    );

    document.body.classList.remove(
        "modal-open"
    );

    activeModalCardId = null;
}

function updateModalDeckQuantity() {
    if (!activeModalCardId) {
        return;
    }

    const quantity =
        getDeckQuantity(
            activeModalCardId
        );

    modalDeckQuantity.textContent =
        `${quantity}枚`;

    modalRemoveButton.disabled =
        quantity <= 0;
}

/* 保存 */

function saveDeck() {
    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(deck)
    );
}

function loadDeckFromStorage() {
    try {
        const savedDeck =
            localStorage.getItem(
                STORAGE_KEY
            );

        if (!savedDeck) {
            return {};
        }

        const parsedDeck =
            JSON.parse(savedDeck);

        if (
            !parsedDeck ||
            typeof parsedDeck !==
                "object" ||
            Array.isArray(parsedDeck)
        ) {
            return {};
        }

        return parsedDeck;

    } catch (error) {
        console.error(
            "デッキ保存データの読み込みに失敗しました。",
            error
        );

        return {};
    }
}

function removeUnknownCardsFromDeck() {
    Object.keys(deck)
        .forEach((cardId) => {
            if (!findCard(cardId)) {
                delete deck[cardId];
            }
        });

    saveDeck();
}

/* 共通関数 */

function findCard(cardId) {
    return cards.find(
        (card) =>
            card.id === cardId
    );
}

function createCardImageHtml(
    card,
    placeholderClass
) {
    if (!card.image) {
        return `
            <span class="${placeholderClass}">
                🃏
            </span>
        `;
    }

    return `
        <img
            src="./images/cards/${escapeHtml(card.image)}"
            alt="${escapeHtml(card.name)}"
            loading="lazy"
            onerror="
                this.parentElement.innerHTML =
                '<span class=&quot;${placeholderClass}&quot;>🃏</span>'
            "
        >
    `;
}

function hasValue(value) {
    return (
        value !== null &&
        value !== undefined &&
        value !== ""
    );
}

function clampScore(value) {
    return Math.max(
        0,
        Math.min(
            100,
            Number(value) || 0
        )
    );
}

function showToast(
    message,
    isError = false
) {
    clearTimeout(toastTimer);

    toast.textContent =
        message;

    toast.classList.toggle(
        "error",
        isError
    );

    toast.classList.add("show");

    toastTimer =
        window.setTimeout(
            () => {
                toast.classList.remove(
                    "show"
                );
            },
            2200
        );
}

function escapeHtml(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

/* イベント */

searchInput.addEventListener(
    "input",
    filterCards
);

colorFilter.addEventListener(
    "change",
    filterCards
);

typeFilter.addEventListener(
    "change",
    filterCards
);

levelFilter.addEventListener(
    "change",
    filterCards
);

deckSearchInput.addEventListener(
    "input",
    renderDeck
);

deckSortSelect.addEventListener(
    "change",
    renderDeck
);

clearDeckButton.addEventListener(
    "click",
    clearDeck
);

cardList.addEventListener(
    "click",
    (event) => {
        const addButton =
            event.target.closest(
                "[data-add-card]"
            );

        if (addButton) {
            event.stopPropagation();

            addCardToDeck(
                addButton.dataset.addCard
            );

            return;
        }

        const cardElement =
            event.target.closest(
                ".digimon-card"
            );

        if (!cardElement) {
            return;
        }

        openCardModal(
            cardElement.dataset.cardId
        );
    }
);

cardList.addEventListener(
    "keydown",
    (event) => {
        if (
            event.key !== "Enter" &&
            event.key !== " "
        ) {
            return;
        }

        const cardElement =
            event.target.closest(
                ".digimon-card"
            );

        if (!cardElement) {
            return;
        }

        event.preventDefault();

        openCardModal(
            cardElement.dataset.cardId
        );
    }
);

deckList.addEventListener(
    "click",
    (event) => {
        const increaseButton =
            event.target.closest(
                "[data-increase-card]"
            );

        if (increaseButton) {
            addCardToDeck(
                increaseButton.dataset
                    .increaseCard
            );

            return;
        }

        const decreaseButton =
            event.target.closest(
                "[data-decrease-card]"
            );

        if (decreaseButton) {
            removeOneCardFromDeck(
                decreaseButton.dataset
                    .decreaseCard
            );

            return;
        }

        const removeButton =
            event.target.closest(
                "[data-remove-card]"
            );

        if (removeButton) {
            removeCardCompletely(
                removeButton.dataset
                    .removeCard
            );
        }
    }
);

modalAddButton.addEventListener(
    "click",
    () => {
        if (activeModalCardId) {
            addCardToDeck(
                activeModalCardId
            );
        }
    }
);

modalRemoveButton.addEventListener(
    "click",
    () => {
        if (activeModalCardId) {
            removeOneCardFromDeck(
                activeModalCardId
            );
        }
    }
);

modalCloseButton.addEventListener(
    "click",
    closeCardModal
);

document
    .querySelectorAll(
        "[data-close-modal]"
    )
    .forEach((element) => {
        element.addEventListener(
            "click",
            closeCardModal
        );
    });

document.addEventListener(
    "keydown",
    (event) => {
        if (
            event.key === "Escape" &&
            cardModal.classList.contains(
                "open"
            )
        ) {
            closeCardModal();
        }
    }
);

/* 起動 */

loadCards();