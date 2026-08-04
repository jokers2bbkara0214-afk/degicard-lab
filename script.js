"use strict";

const MAIN_DECK_LIMIT = 50;
const DEFAULT_CARD_LIMIT = 4;
const STORAGE_KEY = "digicardLabDeck";
const FAVORITES_STORAGE_KEY ="digicardLabFavorites";
const SAVED_DECKS_STORAGE_KEY = "digicardLabSavedDecks";
const generateShareCodeButton =
    document.getElementById("generateShareCodeButton");
const copyShareCodeButton =
    document.getElementById("copyShareCodeButton");
const importShareCodeButton =
    document.getElementById("importShareCodeButton");
const shareCodeOutput =
    document.getElementById("shareCodeOutput");
const shareCodeInput =
    document.getElementById("shareCodeInput");
const aiAnalysisResult =
    document.getElementById("aiAnalysisResult");

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
let favorites = loadFavoritesFromStorage();
let savedDecks = loadSavedDecksFromStorage();
let activeModalCardId = null;
let toastTimer = null;

let radarChartInstance = null;
let scoreBarChartInstance = null;
let scoreAnimationFrame = null;

/* カード図鑑 */

const searchInput =
    document.getElementById("searchInput");

const advancedColorFilters =
    document.querySelectorAll(
        'input[name="advancedColor"]'
    );

const typeFilter =
    document.getElementById("typeFilter");

const levelFilter =
    document.getElementById("levelFilter");

const rarityFilter =
    document.getElementById("rarityFilter");

const setFilter =
    document.getElementById("setFilter");

const traitsFilter =
    document.getElementById("traitsFilter");

const playCostMin =
    document.getElementById("playCostMin");

const playCostMax =
    document.getElementById("playCostMax");

const dpMin =
    document.getElementById("dpMin");

const dpMax =
    document.getElementById("dpMax");

const executeSearchButton =
    document.getElementById("executeSearchButton");

const resetSearchButton =
    document.getElementById("resetSearchButton");

const activeSearchConditions =
    document.getElementById("activeSearchConditions");

const cardSortSelect =
    document.getElementById("cardSortSelect");

const favoriteOnlyFilter =
    document.getElementById("favoriteOnlyFilter");

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

const savedDeckNameInput =
    document.getElementById("savedDeckNameInput");

const saveNamedDeckButton =
    document.getElementById("saveNamedDeckButton");

const exportCurrentDeckButton =
    document.getElementById("exportCurrentDeckButton");

const exportAllDecksButton =
    document.getElementById("exportAllDecksButton");

const importDeckButton =
    document.getElementById("importDeckButton");

const importDeckFileInput =
    document.getElementById("importDeckFileInput");

const savedDeckList =
    document.getElementById("savedDeckList");

const savedDeckCount =
    document.getElementById("savedDeckCount");

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

const scoreStars =
    document.getElementById("scoreStars");

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

const imageLightbox =
    document.getElementById("imageLightbox");

const imageLightboxImage =
    document.getElementById("imageLightboxImage");

const imageLightboxTitle =
    document.getElementById("imageLightboxTitle");

const imageLightboxCloseButton =
    document.getElementById(
        "imageLightboxCloseButton"
    );

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

const modalFavoriteButton =
    document.getElementById("modalFavoriteButton");

const modalRemoveButton =
    document.getElementById("modalRemoveButton");

const modalDeckQuantity =
    document.getElementById(
        "modalDeckQuantity"
    );
const evolutionCardSelect =
    document.getElementById("evolutionCardSelect");

const showEvolutionButton =
    document.getElementById("showEvolutionButton");

const evolutionEmpty =
    document.getElementById("evolutionEmpty");

const evolutionExplorer =
    document.getElementById("evolutionExplorer");

const evolutionTree =
    document.getElementById("evolutionTree");

const evolutionDetail =
    document.getElementById("evolutionDetail");

const evolutionDetailNumber =
    document.getElementById("evolutionDetailNumber");

const evolutionDetailImage =
    document.getElementById("evolutionDetailImage");

const evolutionDetailStatus =
    document.getElementById("evolutionDetailStatus");

const evolutionDetailName =
    document.getElementById("evolutionDetailName");

const evolutionDetailTags =
    document.getElementById("evolutionDetailTags");

const evolutionDetailPlayCost =
    document.getElementById("evolutionDetailPlayCost");

const evolutionDetailDp =
    document.getElementById("evolutionDetailDp");

const evolutionDetailForm =
    document.getElementById("evolutionDetailForm");

const evolutionDetailAttribute =
    document.getElementById("evolutionDetailAttribute");

const evolutionDetailEffect =
    document.getElementById("evolutionDetailEffect");

const evolutionDetailInheritedEffect =
    document.getElementById(
        "evolutionDetailInheritedEffect"
    );

const evolutionDetailOpenButton =
    document.getElementById(
        "evolutionDetailOpenButton"
    );

const evolutionDetailAddButton =
    document.getElementById(
        "evolutionDetailAddButton"
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

    if (pageId === "evolution") {
        populateEvolutionSelect();
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

        populateAdvancedFilterOptions();
        removeUnknownCardsFromDeck();
        renderCards(cards);
        updateAllDeckDisplays();
        renderSavedDecks();

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

    const favorite =
        isFavorite(card.id);

    return `
        <article
            class="digimon-card"
            data-card-id="${escapeHtml(card.id)}"
            tabindex="0"
            role="button"
            aria-label="${escapeHtml(card.name)}の詳細を開く"
        >
            <button
                class="card-favorite-button ${favorite ? "active" : ""}"
                type="button"
                data-toggle-favorite="${escapeHtml(card.id)}"
                aria-label="${escapeHtml(card.name)}をお気に入り${favorite ? "から解除" : "に登録"}"
                aria-pressed="${favorite}"
                title="${favorite ? "お気に入りから解除" : "お気に入りに登録"}"
            >
                ${favorite ? "★" : "☆"}
            </button>

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
    const keyword = normalizeSearchText(
        searchInput.value
    );

    const selectedColors =
        [...advancedColorFilters]
            .filter((checkbox) => checkbox.checked)
            .map((checkbox) => checkbox.value);

    const selectedType =
        typeFilter.value;

    const selectedLevel =
        levelFilter.value;

    const selectedRarity =
        rarityFilter.value;

    const selectedSet =
        setFilter.value;

    const traitsKeyword =
        normalizeSearchText(
            traitsFilter.value
        );

    const minimumPlayCost =
        parseOptionalNumber(
            playCostMin.value
        );

    const maximumPlayCost =
        parseOptionalNumber(
            playCostMax.value
        );

    const minimumDp =
        parseOptionalNumber(dpMin.value);

    const maximumDp =
        parseOptionalNumber(dpMax.value);

    const favoriteOnly =
        favoriteOnlyFilter?.checked || false;

    const filteredCards = cards.filter((card) => {
        const searchableText = normalizeSearchText([
            card.id,
            card.name,
            card.effect,
            card.inheritedEffect,
            card.securityEffect,
            card.form,
            card.attribute,
            ...(Array.isArray(card.traits)
                ? card.traits
                : [])
        ].join(" "));

        const traitText = normalizeSearchText([
            card.form,
            card.attribute,
            ...(Array.isArray(card.traits)
                ? card.traits
                : [])
        ].join(" "));

        const cardColors =
            Array.isArray(card.colors)
                ? card.colors
                : [];

        const matchesKeyword =
            keyword === "" ||
            searchableText.includes(keyword);

        const matchesColors =
            selectedColors.length === 0 ||
            selectedColors.some(
                (color) =>
                    cardColors.includes(color)
            );

        const matchesType =
            selectedType === "" ||
            card.cardType === selectedType;

        const matchesLevel =
            selectedLevel === "" ||
            String(card.level) === selectedLevel;

        const matchesRarity =
            selectedRarity === "" ||
            card.rarity === selectedRarity;

        const matchesSet =
            selectedSet === "" ||
            card.set === selectedSet;

        const matchesTraits =
            traitsKeyword === "" ||
            traitText.includes(traitsKeyword);

        const matchesPlayCost =
            matchesNumberRange(
                card.playCost,
                minimumPlayCost,
                maximumPlayCost
            );

        const matchesDp =
            matchesNumberRange(
                card.dp,
                minimumDp,
                maximumDp
            );

        const matchesFavorite =
            !favoriteOnly ||
            isFavorite(card.id);

        return (
            matchesKeyword &&
            matchesColors &&
            matchesType &&
            matchesLevel &&
            matchesRarity &&
            matchesSet &&
            matchesTraits &&
            matchesPlayCost &&
            matchesDp &&
            matchesFavorite       
         );
    });

        const sortedCards = sortCardResults(
            filteredCards,
            cardSortSelect?.value || "number"
        );

        renderCards(sortedCards);
        renderActiveSearchConditions(
            sortedCards.length
        );
}

function sortCardResults(cardData, sortType) {
    return [...cardData].sort((a, b) => {
        if (sortType === "name") {
            return String(a.name || "").localeCompare(
                String(b.name || ""),
                "ja"
            );
        }

        if (sortType === "level-asc") {
            return (
                getSortableNumber(a.level, 999) -
                getSortableNumber(b.level, 999) ||
                String(a.id || "").localeCompare(
                    String(b.id || "")
                )
            );
        }

        if (sortType === "level-desc") {
            return (
                getSortableNumber(b.level, -1) -
                getSortableNumber(a.level, -1) ||
                String(a.id || "").localeCompare(
                    String(b.id || "")
                )
            );
        }

        if (sortType === "dp-desc") {
            return (
                getSortableNumber(b.dp, -1) -
                getSortableNumber(a.dp, -1) ||
                String(a.id || "").localeCompare(
                    String(b.id || "")
                )
            );
        }

        if (sortType === "cost-asc") {
            return (
                getSortableNumber(a.playCost, 999) -
                getSortableNumber(b.playCost, 999) ||
                String(a.id || "").localeCompare(
                    String(b.id || "")
                )
            );
        }

        return String(a.id || "").localeCompare(
            String(b.id || "")
        );
    });
}

function getSortableNumber(value, fallback) {
    if (!hasValue(value)) {
        return fallback;
    }

    const number = Number(value);

    return Number.isFinite(number)
        ? number
        : fallback;
}

function populateAdvancedFilterOptions() {
    populateSelectOptions(
        rarityFilter,
        cards.map((card) => card.rarity),
        "すべてのレアリティ"
    );

    populateSelectOptions(
        setFilter,
        cards.map((card) => card.set),
        "すべての収録パック"
    );
}

function populateSelectOptions(
    selectElement,
    values,
    defaultLabel
) {
    if (!selectElement) {
        return;
    }

    const currentValue =
        selectElement.value;

    const uniqueValues = [...new Set(
        values
            .filter((value) =>
                value !== null &&
                value !== undefined &&
                String(value).trim() !== ""
            )
            .map((value) => String(value))
    )].sort((a, b) =>
        a.localeCompare(b, "ja")
    );

    selectElement.innerHTML = `
        <option value="">
            ${escapeHtml(defaultLabel)}
        </option>

        ${uniqueValues
            .map(
                (value) => `
                    <option value="${escapeHtml(value)}">
                        ${escapeHtml(value)}
                    </option>
                `
            )
            .join("")}
    `;

    if (uniqueValues.includes(currentValue)) {
        selectElement.value = currentValue;
    }
}

function resetAdvancedSearch() {
    searchInput.value = "";
    typeFilter.value = "";
    levelFilter.value = "";
    rarityFilter.value = "";
    setFilter.value = "";
    traitsFilter.value = "";
    playCostMin.value = "";
    playCostMax.value = "";
    dpMin.value = "";
    dpMax.value = "";

    if (cardSortSelect) {
    cardSortSelect.value = "number";
    }

    if (favoriteOnlyFilter) {
        favoriteOnlyFilter.checked = false;
    }

    advancedColorFilters.forEach(
        (checkbox) => {
            checkbox.checked = false;
        }
    );

    filterCards();
    showToast("検索条件をリセットしました。");
}

function renderActiveSearchConditions(resultCount) {
    if (!activeSearchConditions) {
        return;
    }

    const conditions = [];

    if (favoriteOnlyFilter?.checked) {
        conditions.push("お気に入りのみ");
    }


    if (searchInput.value.trim()) {
        conditions.push(
            `キーワード：${searchInput.value.trim()}`
        );
    }

    const selectedColors =
        [...advancedColorFilters]
            .filter((checkbox) => checkbox.checked)
            .map((checkbox) => checkbox.value);

    if (selectedColors.length > 0) {
        conditions.push(
            `色：${selectedColors.join("・")}`
        );
    }

    if (typeFilter.value) {
        conditions.push(
            `種類：${typeFilter.value}`
        );
    }

    if (levelFilter.value) {
        conditions.push(
            `Lv.${levelFilter.value}`
        );
    }

    if (rarityFilter.value) {
        conditions.push(
            `レアリティ：${rarityFilter.value}`
        );
    }

    if (setFilter.value) {
        conditions.push(
            `収録：${setFilter.value}`
        );
    }

    if (traitsFilter.value.trim()) {
        conditions.push(
            `特徴：${traitsFilter.value.trim()}`
        );
    }

    const playCostText = formatRangeCondition(
        playCostMin.value,
        playCostMax.value,
        "登場コスト"
    );

    if (playCostText) {
        conditions.push(playCostText);
    }

    const dpText = formatRangeCondition(
        dpMin.value,
        dpMax.value,
        "DP"
    );

    if (dpText) {
        conditions.push(dpText);
    }

    activeSearchConditions.textContent =
        conditions.length > 0
            ? `${resultCount}件表示｜${conditions.join(" / ")}`
            : `${resultCount}件表示｜条件なし：すべてのカードを表示中`;
}

function formatRangeCondition(
    minimumValue,
    maximumValue,
    label
) {
    const minimum = String(minimumValue).trim();
    const maximum = String(maximumValue).trim();

    if (!minimum && !maximum) {
        return "";
    }

    if (minimum && maximum) {
        return `${label}：${minimum}～${maximum}`;
    }

    if (minimum) {
        return `${label}：${minimum}以上`;
    }

    return `${label}：${maximum}以下`;
}

function normalizeSearchText(value) {
    return String(value ?? "")
        .normalize("NFKC")
        .toLowerCase()
        .replaceAll(/\s+/g, " ")
        .trim();
}

function parseOptionalNumber(value) {
    if (String(value).trim() === "") {
        return null;
    }

    const number = Number(value);

    return Number.isFinite(number)
        ? number
        : null;
}

function matchesNumberRange(
    cardValue,
    minimum,
    maximum
) {
    if (minimum === null && maximum === null) {
        return true;
    }

    if (!hasValue(cardValue)) {
        return false;
    }

    const number = Number(cardValue);

    if (!Number.isFinite(number)) {
        return false;
    }

    if (minimum !== null && number < minimum) {
        return false;
    }

    if (maximum !== null && number > maximum) {
        return false;
    }

    return true;
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

/* マイデッキ保存・読込 */

function renderSavedDecks() {
    if (!savedDeckList || !savedDeckCount) {
        return;
    }

    const orderedDecks = [...savedDecks]
        .sort((a, b) =>
            String(b.updatedAt || "").localeCompare(
                String(a.updatedAt || "")
            )
        );

    savedDeckCount.textContent =
        `${orderedDecks.length}件`;

    if (orderedDecks.length === 0) {
        savedDeckList.innerHTML = `
            <p class="saved-deck-empty">
                保存されたデッキはありません。<br>
                現在のデッキに名前を付けて保存してみましょう。
            </p>
        `;

        return;
    }

    savedDeckList.innerHTML = orderedDecks
        .map((savedDeck) => {
            const total = getDeckObjectTotal(
                savedDeck.cards
            );

            const uniqueCount = Object.keys(
                savedDeck.cards || {}
            ).length;

            const updatedText = formatSavedDeckDate(
                savedDeck.updatedAt
            );

            return `
                <article class="saved-deck-item">
                    <div class="saved-deck-info">
                        <h3>${escapeHtml(savedDeck.name)}</h3>

                        <div class="saved-deck-meta">
                            <span>${total} / ${MAIN_DECK_LIMIT}枚</span>
                            <span>${uniqueCount}種類</span>
                            <span>更新：${escapeHtml(updatedText)}</span>
                        </div>
                    </div>

                    <div class="saved-deck-actions">
                        <button
                            class="saved-deck-action-button"
                            type="button"
                            data-load-saved-deck="${escapeHtml(savedDeck.id)}"
                        >
                            読み込む
                        </button>

                        <button
                            class="saved-deck-action-button"
                            type="button"
                            data-overwrite-saved-deck="${escapeHtml(savedDeck.id)}"
                        >
                            上書き
                        </button>

                        <button
                            class="saved-deck-action-button"
                            type="button"
                            data-rename-saved-deck="${escapeHtml(savedDeck.id)}"
                        >
                            名前変更
                        </button>

                        <button
                            class="saved-deck-action-button"
                            type="button"
                            data-export-saved-deck="${escapeHtml(savedDeck.id)}"
                        >
                            JSON
                        </button>

                        <button
                            class="saved-deck-action-button danger"
                            type="button"
                            data-delete-saved-deck="${escapeHtml(savedDeck.id)}"
                        >
                            削除
                        </button>
                    </div>
                </article>
            `;
        })
        .join("");
}

function saveCurrentDeckAsNew() {
    const name = String(
        savedDeckNameInput?.value || ""
    ).trim();

    if (!name) {
        showToast(
            "保存するデッキ名を入力してください。",
            true
        );

        savedDeckNameInput?.focus();
        return;
    }

    if (getDeckTotal() === 0) {
        showToast(
            "カードを1枚以上追加してから保存してください。",
            true
        );
        return;
    }

    const now = new Date().toISOString();

    savedDecks.push({
        id: createSavedDeckId(),
        name,
        cards: cloneDeckObject(deck),
        createdAt: now,
        updatedAt: now
    });

    saveSavedDecks();
    renderSavedDecks();

    savedDeckNameInput.value = "";

    showToast(
        `「${name}」をマイデッキへ保存しました。`
    );
}

function loadSavedDeck(savedDeckId) {
    const savedDeck = findSavedDeck(savedDeckId);

    if (!savedDeck) {
        showToast(
            "保存デッキが見つかりませんでした。",
            true
        );
        return;
    }

    if (
        getDeckTotal() > 0 &&
        !window.confirm(
            `現在のデッキを「${savedDeck.name}」へ置き換えますか？`
        )
    ) {
        return;
    }

    deck = sanitizeDeckObject(savedDeck.cards);

    saveDeck();
    updateAllDeckDisplays();

    showToast(
        `「${savedDeck.name}」を読み込みました。`
    );
}

function overwriteSavedDeck(savedDeckId) {
    const savedDeck = findSavedDeck(savedDeckId);

    if (!savedDeck) {
        showToast(
            "保存デッキが見つかりませんでした。",
            true
        );
        return;
    }

    if (getDeckTotal() === 0) {
        showToast(
            "空のデッキでは上書きできません。",
            true
        );
        return;
    }

    const confirmed = window.confirm(
        `「${savedDeck.name}」を現在の内容で上書きしますか？`
    );

    if (!confirmed) {
        return;
    }

    savedDeck.cards = cloneDeckObject(deck);
    savedDeck.updatedAt = new Date().toISOString();

    saveSavedDecks();
    renderSavedDecks();

    showToast(
        `「${savedDeck.name}」を上書き保存しました。`
    );
}

function renameSavedDeck(savedDeckId) {
    const savedDeck = findSavedDeck(savedDeckId);

    if (!savedDeck) {
        return;
    }

    const newName = window.prompt(
        "新しいデッキ名を入力してください。",
        savedDeck.name
    );

    if (newName === null) {
        return;
    }

    const trimmedName = newName.trim();

    if (!trimmedName) {
        showToast(
            "デッキ名を入力してください。",
            true
        );
        return;
    }

    savedDeck.name = trimmedName.slice(0, 40);
    savedDeck.updatedAt = new Date().toISOString();

    saveSavedDecks();
    renderSavedDecks();

    showToast("デッキ名を変更しました。");
}

function deleteSavedDeck(savedDeckId) {
    const savedDeck = findSavedDeck(savedDeckId);

    if (!savedDeck) {
        return;
    }

    const confirmed = window.confirm(
        `「${savedDeck.name}」を削除しますか？`
    );

    if (!confirmed) {
        return;
    }

    savedDecks = savedDecks.filter(
        (item) => item.id !== savedDeckId
    );

    saveSavedDecks();
    renderSavedDecks();

    showToast(
        `「${savedDeck.name}」を削除しました。`
    );
}

function exportCurrentDeck() {
    if (getDeckTotal() === 0) {
        showToast(
            "出力するカードがありません。",
            true
        );
        return;
    }

    const inputName = String(
        savedDeckNameInput?.value || ""
    ).trim();

    const name = inputName || "現在のデッキ";
    const now = new Date().toISOString();

    downloadJsonFile(
        createDeckExportData({
            id: createSavedDeckId(),
            name,
            cards: cloneDeckObject(deck),
            createdAt: now,
            updatedAt: now
        }),
        `${createSafeFileName(name)}.json`
    );

    showToast("現在のデッキをJSON出力しました。");
}

function exportSavedDeck(savedDeckId) {
    const savedDeck = findSavedDeck(savedDeckId);

    if (!savedDeck) {
        return;
    }

    downloadJsonFile(
        createDeckExportData(savedDeck),
        `${createSafeFileName(savedDeck.name)}.json`
    );

    showToast(
        `「${savedDeck.name}」をJSON出力しました。`
    );
}

function exportAllSavedDecks() {
    if (savedDecks.length === 0) {
        showToast(
            "保存されているデッキがありません。",
            true
        );
        return;
    }

    downloadJsonFile(
        {
            app: "DigiCard Lab",
            version: 1,
            type: "deck-library",
            exportedAt: new Date().toISOString(),
            decks: savedDecks.map((savedDeck) => ({
                ...savedDeck,
                cards: cloneDeckObject(savedDeck.cards)
            }))
        },
        "digicard-lab-decks.json"
    );

    showToast("保存デッキをまとめてJSON出力しました。");
}

async function importDeckFile(file) {
    if (!file) {
        return;
    }

    try {
        const text = await file.text();
        const parsedData = JSON.parse(text);
        const importedDecks = parseImportedDeckData(
            parsedData
        );

        if (importedDecks.length === 0) {
            throw new Error(
                "読み込めるデッキがありません。"
            );
        }

        savedDecks.push(...importedDecks);

        saveSavedDecks();
        renderSavedDecks();

        showToast(
            `${importedDecks.length}件のデッキを読み込みました。`
        );

    } catch (error) {
        console.error(error);

        showToast(
            "JSONファイルを読み込めませんでした。",
            true
        );

    } finally {
        if (importDeckFileInput) {
            importDeckFileInput.value = "";
        }
    }
}

function parseImportedDeckData(data) {
    let sourceDecks = [];

    if (
        data?.type === "deck-library" &&
        Array.isArray(data.decks)
    ) {
        sourceDecks = data.decks;

    } else if (
        data?.type === "deck" &&
        data.deck
    ) {
        sourceDecks = [data.deck];

    } else if (
        data &&
        typeof data === "object" &&
        data.cards
    ) {
        sourceDecks = [data];
    }

    return sourceDecks
        .map((item) => {
            const cardsData = sanitizeDeckObject(
                item.cards
            );

            if (getDeckObjectTotal(cardsData) === 0) {
                return null;
            }

            const now = new Date().toISOString();

            return {
                id: createSavedDeckId(),
                name: String(
                    item.name || "読み込んだデッキ"
                ).trim().slice(0, 40) ||
                    "読み込んだデッキ",
                cards: cardsData,
                createdAt: item.createdAt || now,
                updatedAt: now
            };
        })
        .filter(Boolean);
}

function createDeckExportData(savedDeck) {
    return {
        app: "DigiCard Lab",
        version: 1,
        type: "deck",
        exportedAt: new Date().toISOString(),
        deck: {
            ...savedDeck,
            cards: cloneDeckObject(savedDeck.cards)
        }
    };
}

function downloadJsonFile(data, fileName) {
    const blob = new Blob(
        [JSON.stringify(data, null, 2)],
        { type: "application/json" }
    );

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = fileName;

    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();

    URL.revokeObjectURL(url);
}

function findSavedDeck(savedDeckId) {
    return savedDecks.find(
        (savedDeck) =>
            savedDeck.id === savedDeckId
    );
}

function createSavedDeckId() {
    return `deck-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 8)}`;
}

function createSafeFileName(name) {
    const safeName = String(name || "deck")
        .normalize("NFKC")
        .replace(/[\\/:*?"<>|]/g, "-")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 60);

    return safeName || "deck";
}

function formatSavedDeckDate(value) {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "日時不明";
    }

    return new Intl.DateTimeFormat(
        "ja-JP",
        {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit"
        }
    ).format(date);
}

function cloneDeckObject(deckData) {
    return { ...(deckData || {}) };
}

function getDeckObjectTotal(deckData) {
    return Object.values(deckData || {})
        .reduce(
            (total, quantity) =>
                total + Number(quantity || 0),
            0
        );
}

function sanitizeDeckObject(deckData) {
    if (
        !deckData ||
        typeof deckData !== "object" ||
        Array.isArray(deckData)
    ) {
        return {};
    }

    const sanitizedDeck = {};
    let total = 0;

    Object.entries(deckData)
        .forEach(([cardId, quantity]) => {
            const card = findCard(cardId);

            if (!card || total >= MAIN_DECK_LIMIT) {
                return;
            }

            if (
                card.isDigiEgg ||
                card.cardType === "デジタマ"
            ) {
                return;
            }

            const cardLimit = Number(
                card.deckLimit ?? DEFAULT_CARD_LIMIT
            );

            const safeQuantity = Math.min(
                Math.max(
                    Math.floor(Number(quantity) || 0),
                    0
                ),
                cardLimit,
                MAIN_DECK_LIMIT - total
            );

            if (safeQuantity <= 0) {
                return;
            }

            sanitizedDeck[cardId] = safeQuantity;
            total += safeQuantity;
        });

    return sanitizedDeck;
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

    generateAiDeckDiagnosis();
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

function updateAnalysisSummary(analysis) {
    const percentage = Math.min(
        (analysis.total / MAIN_DECK_LIMIT) * 100,
        100
    );

    animateOverallScore(analysis.overall);

    overallRank.textContent =
        `${analysis.rank} RANK`;

    overallMessage.textContent =
        getOverallMessage(analysis.overall);

    if (scoreStars) {
        scoreStars.textContent =
            createScoreStars(analysis.overall);

        scoreStars.setAttribute(
            "aria-label",
            `総合評価 ${analysis.overall}点`
        );
    }

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
                    analysis.typeCounts["デジモン"] /
                    analysis.total
                ) * 100
            )
            : 0;

    analysisDigimonRatio.textContent =
        `デジモン ${digimonRatio}%`;

    applyRankAppearance(analysis.rank);
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
function animateOverallScore(targetScore) {
    if (!overallScore) {
        return;
    }

    if (scoreAnimationFrame) {
        cancelAnimationFrame(scoreAnimationFrame);
    }

    const target = Math.round(
        clampScore(targetScore)
    );

    const startValue =
        Number(overallScore.textContent) || 0;

    const duration = 550;
    const startTime = performance.now();

    function updateScore(currentTime) {
        const elapsed =
            currentTime - startTime;

        const progress = Math.min(
            elapsed / duration,
            1
        );

        const easedProgress =
            1 - Math.pow(1 - progress, 3);

        const currentValue = Math.round(
            startValue +
            (target - startValue) *
            easedProgress
        );

        overallScore.textContent =
            currentValue;

        if (progress < 1) {
            scoreAnimationFrame =
                requestAnimationFrame(
                    updateScore
                );
        } else {
            overallScore.textContent =
                target;

            scoreAnimationFrame = null;
        }
    }

    scoreAnimationFrame =
        requestAnimationFrame(updateScore);
}

function createScoreStars(score) {
    const filledStars = Math.max(
        1,
        Math.min(
            5,
            Math.ceil(score / 20)
        )
    );

    return (
        "★".repeat(filledStars) +
        "☆".repeat(5 - filledStars)
    );
}

function getBreakdownColor(label) {
    const colorMap = {
        "赤": "#f85149",
        "青": "#58a6ff",
        "黄": "#d29922",
        "緑": "#3fb950",
        "黒": "#6e7681",
        "紫": "#bc8cff",
        "白": "#f0f6fc",

        "デジモン": "#58a6ff",
        "テイマー": "#bc8cff",
        "オプション": "#d29922",

        "2": "#8b949e",
        "3": "#3fb950",
        "4": "#58a6ff",
        "5": "#bc8cff",
        "6": "#f85149",
        "7": "#d29922"
    };

    return (
        colorMap[String(label)] ||
        "#58a6ff"
    );
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

    const highest = Math.max(
        ...visibleLabels.map(
            (label) =>
                Number(counts[label] || 0)
        ),
        1
    );

    container.innerHTML =
        visibleLabels
            .map((label) => {
                const value =
                    Number(counts[label] || 0);

                const width = Math.min(
                    (value / highest) * 100,
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

                const displayColor =
                    getBreakdownColor(label);

                return `
                    <div class="breakdown-row">

                        <div class="breakdown-label-wrap">

                            <span
                                class="breakdown-dot"
                                style="
                                    background: ${displayColor};
                                    box-shadow:
                                        0 0 11px ${displayColor}66;
                                "
                            ></span>

                            <span class="breakdown-label">
                                ${escapeHtml(displayLabel)}
                            </span>

                        </div>

                        <div
                            class="breakdown-track"
                            title="${value}枚・${percentage}%"
                        >

                            <div
                                class="breakdown-bar"
                                style="
                                    width: ${width}%;
                                    background:
                                        linear-gradient(
                                            90deg,
                                            ${displayColor}99,
                                            ${displayColor}
                                        );
                                "
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

    updateModalFavoriteButton();

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

function openImageLightbox(cardId) {
    const card = findCard(cardId);

    if (!card) {
        return;
    }

    const imagePath =
        `./images/cards/${encodeURIComponent(card.id)}.webp`;

    const fallbackPath =
        "./images/cards/noimage.webp";

    imageLightboxTitle.textContent =
        `${card.name}（${card.id}）`;

    imageLightboxImage.src = imagePath;
    imageLightboxImage.alt =
        `${card.name}のカード画像`;

    imageLightboxImage.onerror = () => {
        if (
            imageLightboxImage.src.endsWith(
                "noimage.webp"
            )
        ) {
            return;
        }

        imageLightboxImage.src = fallbackPath;
    };

    imageLightbox.classList.add("open");

    imageLightbox.setAttribute(
        "aria-hidden",
        "false"
    );

    document.body.classList.add(
        "image-lightbox-open"
    );

    imageLightboxCloseButton.focus();
}

function closeImageLightbox() {
    imageLightbox.classList.remove("open");

    imageLightbox.setAttribute(
        "aria-hidden",
        "true"
    );

    document.body.classList.remove(
        "image-lightbox-open"
    );

    imageLightboxImage.removeAttribute("src");
    imageLightboxImage.alt = "";
}

function handleImageLightboxKeyboard(event) {
    if (
        event.key !== "Enter" &&
        event.key !== " "
    ) {
        return;
    }

    const image = event.target.closest(
        "[data-card-image-id]"
    );

    if (!image) {
        return;
    }

    event.preventDefault();

    openImageLightbox(
        image.dataset.cardImageId
    );
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

/* お気に入り */

function isFavorite(cardId) {
    return favorites.has(cardId);
}

function toggleFavorite(cardId) {
    const card = findCard(cardId);

    if (!card) {
        showToast(
            "カードが見つかりませんでした。",
            true
        );

        return;
    }

    if (favorites.has(cardId)) {
        favorites.delete(cardId);
        showToast(
            `${card.name}をお気に入りから解除しました。`
        );
    } else {
        favorites.add(cardId);
        showToast(
            `${card.name}をお気に入りに登録しました。`
        );
    }

    saveFavorites();
    filterCards();
    updateModalFavoriteButton();
}

function updateModalFavoriteButton() {
    if (
        !modalFavoriteButton ||
        !activeModalCardId
    ) {
        return;
    }

    const favorite =
        isFavorite(activeModalCardId);

    modalFavoriteButton.textContent =
        favorite
            ? "★ お気に入り登録済み"
            : "☆ お気に入り";

    modalFavoriteButton.classList.toggle(
        "active",
        favorite
    );

    modalFavoriteButton.setAttribute(
        "aria-pressed",
        String(favorite)
    );
}

function saveFavorites() {
    localStorage.setItem(
        FAVORITES_STORAGE_KEY,
        JSON.stringify([...favorites])
    );
}

function loadFavoritesFromStorage() {
    try {
        const savedFavorites =
            localStorage.getItem(
                FAVORITES_STORAGE_KEY
            );

        if (!savedFavorites) {
            return new Set();
        }

        const parsedFavorites =
            JSON.parse(savedFavorites);

        if (!Array.isArray(parsedFavorites)) {
            return new Set();
        }

        return new Set(
            parsedFavorites.filter(
                (cardId) =>
                    typeof cardId === "string"
            )
        );

    } catch (error) {
        console.error(
            "お気に入りの読み込みに失敗しました。",
            error
        );

        return new Set();
    }
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

function saveSavedDecks() {
    localStorage.setItem(
        SAVED_DECKS_STORAGE_KEY,
        JSON.stringify(savedDecks)
    );
}

function loadSavedDecksFromStorage() {
    try {
        const savedData = localStorage.getItem(
            SAVED_DECKS_STORAGE_KEY
        );

        if (!savedData) {
            return [];
        }

        const parsedData = JSON.parse(savedData);

        if (!Array.isArray(parsedData)) {
            return [];
        }

        return parsedData
            .filter((item) =>
                item &&
                typeof item === "object" &&
                typeof item.id === "string" &&
                typeof item.name === "string" &&
                item.cards &&
                typeof item.cards === "object" &&
                !Array.isArray(item.cards)
            )
            .map((item) => ({
                id: item.id,
                name: item.name.slice(0, 40),
                cards: cloneDeckObject(item.cards),
                createdAt:
                    item.createdAt ||
                    new Date().toISOString(),
                updatedAt:
                    item.updatedAt ||
                    item.createdAt ||
                    new Date().toISOString()
            }));

    } catch (error) {
        console.error(
            "保存デッキの読み込みに失敗しました。",
            error
        );

        return [];
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
    const imagePath =
        `./images/cards/${encodeURIComponent(card.id)}.webp`;

    const fallbackPath =
        "./images/cards/noimage.webp";

    return `
        <img
            src="${imagePath}"
            alt="${escapeHtml(card.name || "カード画像")}"
            loading="lazy"
            tabindex="0"
            role="button"
            data-card-image-id="${escapeHtml(card.id)}"
            aria-label="${escapeHtml(card.name || "カード")}の画像を拡大表示"
            onerror="
                if (!this.dataset.fallback) {
                    this.dataset.fallback = 'true';
                    this.src = '${fallbackPath}';
                } else {
                    this.parentElement.innerHTML =
                        '<span class=&quot;${placeholderClass}&quot;>🃏</span>';
                }
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
function populateEvolutionSelect() {
    if (!evolutionCardSelect) {
        return;
    }

    const currentValue =
        evolutionCardSelect.value;

    const digimonCards = cards
        .filter(
            (card) =>
                card.cardType === "デジモン"
        )
        .sort((a, b) => {
            const levelA =
                hasValue(a.level)
                    ? Number(a.level)
                    : 99;

            const levelB =
                hasValue(b.level)
                    ? Number(b.level)
                    : 99;

            return (
                levelA - levelB ||
                a.name.localeCompare(
                    b.name,
                    "ja"
                )
            );
        });

    evolutionCardSelect.innerHTML = `
        <option value="">
            デジモンを選択してください
        </option>

        ${digimonCards
            .map(
                (card) => `
                    <option value="${escapeHtml(card.id)}">
                        ${
                            hasValue(card.level)
                                ? `Lv.${card.level} `
                                : ""
                        }
                        ${escapeHtml(card.name)}
                        （${escapeHtml(card.id)}）
                    </option>
                `
            )
            .join("")}
    `;

    if (
        currentValue &&
        digimonCards.some(
            (card) =>
                card.id === currentValue
        )
    ) {
        evolutionCardSelect.value =
            currentValue;
    }
}

function showSelectedEvolutionRoute() {
    const selectedCardId =
        evolutionCardSelect.value;

    if (!selectedCardId) {
        showToast(
            "デジモンを選択してください。",
            true
        );

        return;
    }

    renderEvolutionRoute(
        selectedCardId
    );
}

function renderEvolutionRoute(cardId) {
    const selectedCard =
        findCard(cardId);

    if (!selectedCard) {
        showToast(
            "選択したカードが見つかりません。",
            true
        );

        return;
    }

    const route =
        buildEvolutionRoute(cardId);

if (route.length === 0) {
    evolutionEmpty.hidden = false;
    evolutionExplorer.hidden = true;

    return;
}

evolutionEmpty.hidden = true;
evolutionExplorer.hidden = false;

showEvolutionDetail(selectedCard);

    evolutionTree.innerHTML =
        route
            .map(
                (card, index) => {
                    const nextCard =
                        route[index + 1];

                    const connectorHtml =
                        nextCard
                            ? createEvolutionConnectorHtml(
                                card,
                                nextCard
                            )
                            : "";

                    return `
                        ${createEvolutionNodeHtml(
                            card,
                            card.id === cardId
                        )}

                        ${connectorHtml}
                    `;
                }
            )
            .join("");
}
function showEvolutionDetail(card) {
    if (!card) {
        evolutionDetail.hidden = true;
        return;
    }

    evolutionDetail.hidden = false;

    evolutionDetail.dataset.cardId =
        card.id;

    evolutionDetailNumber.textContent =
        card.id || "-";

    evolutionDetailStatus.textContent =
        "⭐ 選択中";

    evolutionDetailName.textContent =
        card.name || "カード名なし";

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

    evolutionDetailTags.innerHTML = `
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

    evolutionDetailPlayCost.textContent =
        card.playCost ?? "-";

    evolutionDetailDp.textContent =
        hasValue(card.dp)
            ? `${Number(card.dp).toLocaleString()} DP`
            : "-";

    evolutionDetailForm.textContent =
        card.form || "-";

    evolutionDetailAttribute.textContent =
        card.attribute || "-";

    evolutionDetailEffect.textContent =
        card.effect?.trim()
            ? card.effect
            : "効果なし";

    evolutionDetailInheritedEffect.textContent =
        card.inheritedEffect?.trim()
            ? card.inheritedEffect
            : "進化元効果なし";

    evolutionDetailImage.innerHTML =
        createCardImageHtml(
            card,
            "card-placeholder"
        );
}

function buildEvolutionRoute(cardId) {
    const selectedCard =
        findCard(cardId);

    if (!selectedCard) {
        return [];
    }

    const predecessors = [];
    const visitedBefore =
        new Set([cardId]);

    let currentCard =
        selectedCard;

    while (
        Array.isArray(
            currentCard.evolutionPredecessors
        ) &&
        currentCard.evolutionPredecessors.length > 0
    ) {
        const predecessorId =
            currentCard.evolutionPredecessors[0];

        if (
            visitedBefore.has(
                predecessorId
            )
        ) {
            break;
        }

        const predecessor =
            findCard(predecessorId);

        if (!predecessor) {
            break;
        }

        predecessors.unshift(
            predecessor
        );

        visitedBefore.add(
            predecessorId
        );

        currentCard =
            predecessor;
    }

    const successors = [];
    const visitedAfter =
        new Set([cardId]);

    currentCard =
        selectedCard;

    while (
        Array.isArray(
            currentCard.evolutionSuccessors
        ) &&
        currentCard.evolutionSuccessors.length > 0
    ) {
        const successorId =
            currentCard.evolutionSuccessors[0];

        if (
            visitedAfter.has(
                successorId
            )
        ) {
            break;
        }

        const successor =
            findCard(successorId);

        if (!successor) {
            break;
        }

        successors.push(
            successor
        );

        visitedAfter.add(
            successorId
        );

        currentCard =
            successor;
    }

    return [
        ...predecessors,
        selectedCard,
        ...successors
    ];
}

function createEvolutionNodeHtml(
    card,
    isCurrent
) {
    const colors =
        Array.isArray(card.colors)
            ? card.colors
            : [];

    const levelText =
        hasValue(card.level)
            ? `Lv.${card.level}`
            : "レベルなし";

    const imageHtml =
        createCardImageHtml(
            card,
            "card-placeholder"
        );

    return `
        <article
            class="evolution-node ${
                isCurrent
                    ? "current"
                    : ""
            }"
            data-evolution-card-id="${escapeHtml(card.id)}"
        >
            ${
                isCurrent
                    ? `
                        <span class="evolution-current-badge">
                            ⭐ 選択中
                        </span>
                    `
                    : ""
            }

            <div class="evolution-node-image">
                ${imageHtml}
            </div>

            <p class="evolution-node-number">
                ${escapeHtml(card.id)}
            </p>

            <h2 class="evolution-node-name">
                ${escapeHtml(card.name)}
            </h2>

            <div class="evolution-node-tags">
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
                    ${levelText}
                </span>

                <span class="card-tag">
                    ${escapeHtml(card.form || "-")}
                </span>
            </div>
        </article>
    `;
}

function createEvolutionConnectorHtml(
    currentCard,
    nextCard
) {
    const costs =
        Array.isArray(
            nextCard.digivolutionCosts
        )
            ? nextCard.digivolutionCosts
            : [];

    const matchingCost =
        costs.find(
            (cost) =>
                Number(cost.level) ===
                Number(currentCard.level)
        ) ||
        costs[0];

    const costText =
        matchingCost
            ? `${matchingCost.color || "-"}・進化コスト${matchingCost.cost ?? "-"}`
            : "進化条件未登録";

    return `
        <div class="evolution-connector">

            <div class="evolution-line"></div>

            <div class="evolution-cost">
                ${escapeHtml(costText)}
            </div>

            <div class="evolution-arrow">
                ↓
            </div>

        </div>
    `;
}

/* イベント */

searchInput.addEventListener(
    "input",
    filterCards
);

traitsFilter.addEventListener(
    "input",
    filterCards
);

[
    typeFilter,
    levelFilter,
    rarityFilter,
    setFilter
].forEach((element) => {
    element.addEventListener(
        "change",
        filterCards
    );
});

[
    playCostMin,
    playCostMax,
    dpMin,
    dpMax
].forEach((element) => {
    element.addEventListener(
        "input",
        filterCards
    );
});

advancedColorFilters.forEach(
    (checkbox) => {
        checkbox.addEventListener(
            "change",
            filterCards
        );
    }
);

executeSearchButton.addEventListener(
    "click",
    filterCards
);

resetSearchButton.addEventListener(
    "click",
    resetAdvancedSearch
);

cardSortSelect.addEventListener(
    "change",
    filterCards
);

favoriteOnlyFilter.addEventListener(
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

saveNamedDeckButton.addEventListener(
    "click",
    saveCurrentDeckAsNew
);

savedDeckNameInput.addEventListener(
    "keydown",
    (event) => {
        if (event.key === "Enter") {
            saveCurrentDeckAsNew();
        }
    }
);

exportCurrentDeckButton.addEventListener(
    "click",
    exportCurrentDeck
);

exportAllDecksButton.addEventListener(
    "click",
    exportAllSavedDecks
);

importDeckButton.addEventListener(
    "click",
    () => {
        importDeckFileInput.click();
    }
);

importDeckFileInput.addEventListener(
    "change",
    () => {
        importDeckFile(
            importDeckFileInput.files?.[0]
        );
    }
);

savedDeckList.addEventListener(
    "click",
    (event) => {
        const loadButton = event.target.closest(
            "[data-load-saved-deck]"
        );

        if (loadButton) {
            loadSavedDeck(
                loadButton.dataset.loadSavedDeck
            );
            return;
        }

        const overwriteButton = event.target.closest(
            "[data-overwrite-saved-deck]"
        );

        if (overwriteButton) {
            overwriteSavedDeck(
                overwriteButton.dataset
                    .overwriteSavedDeck
            );
            return;
        }

        const renameButton = event.target.closest(
            "[data-rename-saved-deck]"
        );

        if (renameButton) {
            renameSavedDeck(
                renameButton.dataset.renameSavedDeck
            );
            return;
        }

        const exportButton = event.target.closest(
            "[data-export-saved-deck]"
        );

        if (exportButton) {
            exportSavedDeck(
                exportButton.dataset.exportSavedDeck
            );
            return;
        }

        const deleteButton = event.target.closest(
            "[data-delete-saved-deck]"
        );

        if (deleteButton) {
            deleteSavedDeck(
                deleteButton.dataset.deleteSavedDeck
            );
        }
    }
);

cardList.addEventListener(
    "click",
    (event) => {
        const favoriteButton =
            event.target.closest(
                "[data-toggle-favorite]"
            );

        if (favoriteButton) {
            event.stopPropagation();

            toggleFavorite(
                favoriteButton.dataset
                    .toggleFavorite
            );

            return;
        }

        const imageButton =
            event.target.closest(
                "[data-card-image-id]"
            );

        if (imageButton) {
            event.stopPropagation();

            openImageLightbox(
                imageButton.dataset.cardImageId
            );

            return;
        }

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

modalFavoriteButton.addEventListener(
    "click",
    () => {
        if (activeModalCardId) {
            toggleFavorite(
                activeModalCardId
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

imageLightboxCloseButton.addEventListener(
    "click",
    closeImageLightbox
);

document
    .querySelectorAll(
        "[data-close-image-lightbox]"
    )
    .forEach((element) => {
        element.addEventListener(
            "click",
            closeImageLightbox
        );
    });

modalCardImage.addEventListener(
    "click",
    (event) => {
        const image = event.target.closest(
            "[data-card-image-id]"
        );

        if (image) {
            openImageLightbox(
                image.dataset.cardImageId
            );
        }
    }
);

evolutionDetailImage.addEventListener(
    "click",
    (event) => {
        const image = event.target.closest(
            "[data-card-image-id]"
        );

        if (image) {
            openImageLightbox(
                image.dataset.cardImageId
            );
        }
    }
);

document.addEventListener(
    "keydown",
    handleImageLightboxKeyboard
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
        if (event.key !== "Escape") {
            return;
        }

        if (
            imageLightbox.classList.contains(
                "open"
            )
        ) {
            closeImageLightbox();
            return;
        }

        if (
            cardModal.classList.contains(
                "open"
            )
        ) {
            closeCardModal();
        }
    }
);

showEvolutionButton.addEventListener(
    "click",
    showSelectedEvolutionRoute
);

evolutionCardSelect.addEventListener(
    "change",
    () => {
        if (
            evolutionCardSelect.value
        ) {
            renderEvolutionRoute(
                evolutionCardSelect.value
            );
        } else {
            evolutionEmpty.hidden = false;
            evolutionExplorer.hidden = true;
        }   }
);

evolutionTree.addEventListener(
    "click",
    (event) => {

        const imageButton =
            event.target.closest(
                "[data-card-image-id]"
            );

        if (imageButton) {
            event.stopPropagation();

            openImageLightbox(
                imageButton.dataset.cardImageId
            );

            return;
        }

        const node =
            event.target.closest(
                "[data-evolution-card-id]"
            );

        if (!node) {
            return;
        }

        const selectedId =
            node.dataset.evolutionCardId;

        evolutionCardSelect.value =
            selectedId;

        renderEvolutionRoute(
            selectedId
        );

        showEvolutionDetail(
            findCard(selectedId)
        );

    }
);

evolutionDetailOpenButton.addEventListener(
    "click",
    () => {

        const cardId =
            evolutionDetail.dataset.cardId;

        if (!cardId) {
            return;
        }

        openCardModal(cardId);

    }
);

evolutionDetailAddButton.addEventListener(
    "click",
    () => {

        const cardId =
            evolutionDetail.dataset.cardId;

        if (!cardId) {
            return;
        }

        addCardToDeck(cardId);

    }
);

function createShareData() {
    return {
        version: "1.0",
        createdAt: new Date().toISOString(),
        deck: { ...deck }
    };
}

function generateShareCode() {

    const data = createShareData();

    const json = JSON.stringify(data);

    const code = btoa(
        unescape(
            encodeURIComponent(json)
        )
    );

    shareCodeOutput.value = "DCL1:" + code;

}
if (generateShareCodeButton) {

    generateShareCodeButton.addEventListener(
        "click",
        generateShareCode
    );

}

function copyShareCode() {

    if (!shareCodeOutput.value) {

        alert("共有コードを生成してください。");
        return;

    }

    navigator.clipboard.writeText(
        shareCodeOutput.value
    );

    alert("共有コードをコピーしました！");
}

if (copyShareCodeButton) {

    copyShareCodeButton.addEventListener(
        "click",
        copyShareCode
    );

}

function importShareCode() {

    const text = shareCodeInput.value.trim();

    if (!text) {
        alert("共有コードを入力してください。");
        return;
    }

    if (!text.startsWith("DCL1:")) {
        alert("共有コードの形式が違います。");
        return;
    }

    try {

        const base64 = text.replace("DCL1:", "");

        const json = decodeURIComponent(
            escape(
                atob(base64)
            )
        );

        const data = JSON.parse(json);

        if (!data.deck) {
            throw new Error();
        }

        deck = data.deck;

        saveDeck();

        renderDeck();

        alert("デッキを読み込みました！");

    } catch {

        alert("共有コードを読み込めませんでした。");

    }

}

if (importShareCodeButton) {

    importShareCodeButton.addEventListener(
        "click",
        importShareCode
    );

}

function generateAiDeckDiagnosis() {
    if (!aiAnalysisResult) {
        return;
    }

    const deckEntries = Object.entries(deck);

    if (deckEntries.length === 0) {
        aiAnalysisResult.innerHTML = `
            <div class="ai-report-empty">
                <span class="ai-report-empty-icon">🤖</span>
                <strong>診断するカードがありません</strong>
                <p>
                    カード図鑑からデッキへカードを追加すると、
                    診断レポートが表示されます。
                </p>
            </div>
        `;
        return;
    }

    const levelCounts = {
        3: 0,
        4: 0,
        5: 0,
        6: 0
    };

    const colorCounts = {};

    let totalCards = 0;
    let digimonCards = 0;
    let supportCards = 0;
    let totalPlayCost = 0;
    let playCostCount = 0;
    let totalDp = 0;
    let dpCount = 0;

    deckEntries.forEach(([cardId, quantity]) => {
        const card = cards.find(
            (item) => item.id === cardId
        );

        if (!card) {
            return;
        }

        const count = Number(quantity) || 0;

        if (count <= 0) {
            return;
        }

        totalCards += count;

        if (
            card.cardType === "デジモン" ||
            card.cardType === "デジタマ"
        ) {
            digimonCards += count;
        } else {
            supportCards += count;
        }

        if (
            hasValue(card.level) &&
            Object.hasOwn(
                levelCounts,
                Number(card.level)
            )
        ) {
            levelCounts[Number(card.level)] += count;
        }

        if (Array.isArray(card.colors)) {
            card.colors.forEach((color) => {
                colorCounts[color] =
                    (colorCounts[color] || 0) + count;
            });
        }

        if (
            hasValue(card.playCost) &&
            Number.isFinite(Number(card.playCost))
        ) {
            totalPlayCost +=
                Number(card.playCost) * count;

            playCostCount += count;
        }

        if (
            hasValue(card.dp) &&
            Number.isFinite(Number(card.dp))
        ) {
            totalDp +=
                Number(card.dp) * count;

            dpCount += count;
        }
    });

    const averagePlayCost =
        playCostCount > 0
            ? totalPlayCost / playCostCount
            : 0;

    const averageDp =
        dpCount > 0
            ? totalDp / dpCount
            : 0;

    const colorCount =
        Object.keys(colorCounts).length;

    const supportRatio =
        totalCards > 0
            ? Math.round(
                (supportCards / totalCards) * 100
            )
            : 0;

    const digimonRatio =
        totalCards > 0
            ? Math.round(
                (digimonCards / totalCards) * 100
            )
            : 0;

    const strengths = [];
    const weaknesses = [];
    const priorities = [];

    /*
     * デッキ枚数
     */

    if (totalCards === MAIN_DECK_LIMIT) {
        strengths.push(
            "メインデッキが50枚で完成しています。"
        );
    } else if (totalCards < MAIN_DECK_LIMIT) {
        weaknesses.push(
            `現在${totalCards}枚です。あと${MAIN_DECK_LIMIT - totalCards}枚追加できます。`
        );

        priorities.push({
            level: "high",
            label: "最優先",
            title: "デッキを50枚まで完成させる",
            text: `残り${MAIN_DECK_LIMIT - totalCards}枚を追加して、構成全体を整えましょう。`
        });
    } else {
        weaknesses.push(
            `現在${totalCards}枚です。メインデッキ上限の50枚を超えています。`
        );

        priorities.push({
            level: "high",
            label: "最優先",
            title: "デッキを50枚に調整する",
            text: `${totalCards - MAIN_DECK_LIMIT}枚減らす必要があります。`
        });
    }

    /*
     * Lv.3
     */

    if (
        levelCounts[3] >= 10 &&
        levelCounts[3] <= 14
    ) {
        strengths.push(
            `Lv.3が${levelCounts[3]}枚あり、序盤の進化元が安定しています。`
        );
    } else if (levelCounts[3] < 10) {
        weaknesses.push(
            `Lv.3が${levelCounts[3]}枚と少なめです。序盤にデジモンを出せない可能性があります。`
        );

        priorities.push({
            level: "high",
            label: "優先度 高",
            title: "Lv.3を増やす",
            text: "10〜14枚を目安にすると、序盤の動きが安定しやすくなります。"
        });
    } else {
        weaknesses.push(
            `Lv.3が${levelCounts[3]}枚と多めです。高レベルカードの枠を圧迫していないか確認しましょう。`
        );
    }

    /*
     * Lv.4
     */

    if (
        levelCounts[4] >= 8 &&
        levelCounts[4] <= 12
    ) {
        strengths.push(
            `Lv.4が${levelCounts[4]}枚あり、成熟期への進化が安定しています。`
        );
    } else if (levelCounts[4] < 8) {
        weaknesses.push(
            `Lv.4が${levelCounts[4]}枚です。進化が途中で止まりやすい構成です。`
        );

        priorities.push({
            level: "high",
            label: "優先度 高",
            title: "Lv.4を増やす",
            text: "8〜12枚を目安に成熟期を追加しましょう。"
        });
    } else {
        weaknesses.push(
            `Lv.4が${levelCounts[4]}枚と多めです。Lv.5以上との比率を確認しましょう。`
        );
    }

    /*
     * Lv.5
     */

    if (
        levelCounts[5] >= 6 &&
        levelCounts[5] <= 10
    ) {
        strengths.push(
            `Lv.5が${levelCounts[5]}枚あり、Lv.6へつなげやすい構成です。`
        );
    } else if (levelCounts[5] < 6) {
        weaknesses.push(
            `Lv.5が${levelCounts[5]}枚です。完全体を引けず、進化が止まる可能性があります。`
        );

        priorities.push({
            level: "medium",
            label: "優先度 中",
            title: "Lv.5を補強する",
            text: "6〜10枚を目安に完全体を追加すると、切り札へつなぎやすくなります。"
        });
    }

    /*
     * Lv.6
     */

    if (
        levelCounts[6] >= 3 &&
        levelCounts[6] <= 6
    ) {
        strengths.push(
            `Lv.6が${levelCounts[6]}枚あり、切り札の枚数は良好です。`
        );
    } else if (levelCounts[6] < 3) {
        weaknesses.push(
            `Lv.6が${levelCounts[6]}枚です。勝ち筋となる切り札が少なめです。`
        );

        priorities.push({
            level: "medium",
            label: "優先度 中",
            title: "Lv.6の切り札を追加する",
            text: "3〜6枚を目安に、デッキのゴールとなるカードを用意しましょう。"
        });
    } else {
        weaknesses.push(
            `Lv.6が${levelCounts[6]}枚と多めです。序盤に使えないカードが手札へ集まりやすくなります。`
        );
    }

    /*
     * 色
     */

    if (colorCount === 1) {
        strengths.push(
            "単色構成なので、進化条件や色条件を満たしやすいです。"
        );
    } else if (colorCount === 2) {
        strengths.push(
            "2色構成です。カード同士の色条件が噛み合っているか確認できれば、選択肢の広い構成になります。"
        );
    } else if (colorCount >= 3) {
        weaknesses.push(
            `使用色が${colorCount}色あります。色条件が噛み合わない事故に注意が必要です。`
        );

        priorities.push({
            level: "medium",
            label: "優先度 中",
            title: "使用色を整理する",
            text: "中心となる1〜2色を決めると、進化とカード使用の安定性が上がります。"
        });
    }

    /*
     * 平均登場コスト
     */

    if (averagePlayCost > 0 && averagePlayCost < 4.5) {
        strengths.push(
            `平均登場コストは${averagePlayCost.toFixed(1)}で、軽く動きやすい構成です。`
        );
    } else if (
        averagePlayCost >= 4.5 &&
        averagePlayCost < 6
    ) {
        strengths.push(
            `平均登場コストは${averagePlayCost.toFixed(1)}で、標準的な範囲です。`
        );
    } else if (averagePlayCost >= 6) {
        weaknesses.push(
            `平均登場コストは${averagePlayCost.toFixed(1)}です。カードを直接登場させる動きが重くなりやすいです。`
        );

        priorities.push({
            level: "low",
            label: "優先度 低",
            title: "低コストカードを増やす",
            text: "登場コストの軽いカードを採用すると、序盤の選択肢が増えます。"
        });
    }

    /*
     * サポート比率
     */

    if (
        supportRatio >= 15 &&
        supportRatio <= 40
    ) {
        strengths.push(
            `テイマー・オプション比率は${supportRatio}%で、バランスの良い範囲です。`
        );
    } else if (supportRatio < 15) {
        weaknesses.push(
            `テイマー・オプションは${supportRatio}%です。補助カードが少なく、対応力が不足する可能性があります。`
        );

        priorities.push({
            level: "low",
            label: "優先度 低",
            title: "補助カードを追加する",
            text: "テイマーやオプションを少し増やすと、除去・展開補助・メモリー管理がしやすくなります。"
        });
    } else {
        weaknesses.push(
            `テイマー・オプションは${supportRatio}%です。デジモン不足で進化しにくくなる可能性があります。`
        );

        priorities.push({
            level: "medium",
            label: "優先度 中",
            title: "デジモンの比率を増やす",
            text: "進化ラインに必要なデジモンを増やし、手札事故を減らしましょう。"
        });
    }

    /*
     * 平均DP
     */

    if (averageDp >= 8000) {
        strengths.push(
            `デジモンの平均DPは${Math.round(averageDp).toLocaleString()}で、盤面で戦いやすい数値です。`
        );
    } else if (averageDp > 0) {
        weaknesses.push(
            `デジモンの平均DPは${Math.round(averageDp).toLocaleString()}です。低レベル中心の場合は、効果や進化速度で補えるか確認しましょう。`
        );
    }

    /*
     * 優先順位を高 → 中 → 低で並び替え
     */

    const priorityOrder = {
        high: 1,
        medium: 2,
        low: 3
    };

    priorities.sort(
        (a, b) =>
            priorityOrder[a.level] -
            priorityOrder[b.level]
    );

    /*
     * 総評
     */

    let summaryTitle = "";
    let summaryText = "";

    if (
        totalCards === MAIN_DECK_LIMIT &&
        weaknesses.length <= 2
    ) {
        summaryTitle =
            "完成度の高いデッキです";

        summaryText =
            "基本的な枚数配分が整っています。実際に対戦しながら、使いにくかったカードを少しずつ調整していきましょう。";
    } else if (strengths.length >= weaknesses.length) {
        summaryTitle =
            "良い土台ができています";

        summaryText =
            "強みを残しながら、優先度の高い改善点から順番に調整すると、さらに安定したデッキになります。";
    } else {
        summaryTitle =
            "伸びしろの大きいデッキです";

        summaryText =
            "まずは進化ラインとデッキ枚数を整えましょう。一度に全部変えず、最優先の項目から直すのがおすすめです。";
    }

    const createListHtml = (
        items,
        emptyMessage
    ) => {
        if (items.length === 0) {
            return `
                <p class="ai-report-empty-text">
                    ${escapeHtml(emptyMessage)}
                </p>
            `;
        }

        return `
            <ul class="ai-report-list">
                ${items
                    .map(
                        (item) => `
                            <li>
                                ${escapeHtml(item)}
                            </li>
                        `
                    )
                    .join("")}
            </ul>
        `;
    };

    const priorityHtml =
        priorities.length > 0
            ? priorities
                .slice(0, 4)
                .map(
                    (priority, index) => `
                        <article class="ai-priority-item ${priority.level}">
                            <div class="ai-priority-number">
                                ${index + 1}
                            </div>

                            <div>
                                <span class="ai-priority-label">
                                    ${escapeHtml(priority.label)}
                                </span>

                                <h4>
                                    ${escapeHtml(priority.title)}
                                </h4>

                                <p>
                                    ${escapeHtml(priority.text)}
                                </p>
                            </div>
                        </article>
                    `
                )
                .join("")
            : `
                <p class="ai-report-empty-text">
                    大きな改善点はありません。
                    対戦結果に合わせて微調整しましょう。
                </p>
            `;

    aiAnalysisResult.innerHTML = `
        <div class="ai-report-summary">
            <div class="ai-report-icon">🤖</div>

            <div>
                <p class="ai-report-kicker">
                    AI DECK REPORT
                </p>

                <h3>
                    ${escapeHtml(summaryTitle)}
                </h3>

                <p>
                    ${escapeHtml(summaryText)}
                </p>
            </div>
        </div>

        <div class="ai-report-metrics">
            <div>
                <span>デッキ枚数</span>
                <strong>
                    ${totalCards} / ${MAIN_DECK_LIMIT}
                </strong>
            </div>

            <div>
                <span>デジモン比率</span>
                <strong>
                    ${digimonRatio}%
                </strong>
            </div>

            <div>
                <span>平均コスト</span>
                <strong>
                    ${averagePlayCost.toFixed(1)}
                </strong>
            </div>

            <div>
                <span>平均DP</span>
                <strong>
                    ${
                        averageDp > 0
                            ? Math.round(averageDp).toLocaleString()
                            : "-"
                    }
                </strong>
            </div>
        </div>

        <div class="ai-report-grid">
            <section class="ai-report-section strength">
                <h3>💪 強み</h3>

                ${createListHtml(
                    strengths,
                    "現在、明確な強みはまだ判定できません。"
                )}
            </section>

            <section class="ai-report-section weakness">
                <h3>⚠️ 改善ポイント</h3>

                ${createListHtml(
                    weaknesses,
                    "大きな改善点は見つかりませんでした。"
                )}
            </section>
        </div>

        <section class="ai-report-section priority">
            <h3>🎯 改善する順番</h3>

            <div class="ai-priority-list">
                ${priorityHtml}
            </div>
        </section>
    `;
}

/* 起動 */

loadCards();