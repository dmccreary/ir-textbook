const { createApp } = Vue;

createApp({
    data() {
        return {
            // Data
            glossaryData: null,
            categories: {},
            terms: [],

            // UI State
            activeTab: 'alphabetical',
            searchQuery: '',
            selectedLetter: null,
            expandedTerms: [],
            expandedCategory: null,
            selectedTerm: null,
            showAllBeginner: false,

            // Tabs
            tabs: [
                { id: 'alphabetical', label: 'Alphabetical' },
                { id: 'category', label: 'By Category' },
                { id: 'learning-path', label: 'Learning Path' }
            ],

            // Alphabet for filtering
            alphabet: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
        };
    },

    computed: {
        totalTerms() {
            return this.terms.length;
        },

        filteredTerms() {
            let filtered = this.terms;

            // Apply search filter
            if (this.searchQuery) {
                const query = this.searchQuery.toLowerCase();
                filtered = filtered.filter(term =>
                    term.name.toLowerCase().includes(query) ||
                    term.definition.toLowerCase().includes(query) ||
                    (term.example && term.example.toLowerCase().includes(query))
                );
            }

            // Apply letter filter
            if (this.selectedLetter) {
                filtered = filtered.filter(term =>
                    term.name.startsWith(this.selectedLetter)
                );
            }

            return filtered;
        },

        alphabeticalTerms() {
            return this.filteredTerms.sort((a, b) =>
                a.name.localeCompare(b.name)
            );
        },

        coreTerms() {
            return this.terms
                .filter(term => term.isCore)
                .sort((a, b) => a.name.localeCompare(b.name));
        },

        beginnerTerms() {
            return this.terms
                .filter(term => term.difficulty === 'beginner' && !term.isCore)
                .sort((a, b) => a.name.localeCompare(b.name));
        },

        displayedBeginnerTerms() {
            return this.showAllBeginner
                ? this.beginnerTerms
                : this.beginnerTerms.slice(0, 20);
        },

        intermediateTerms() {
            return this.terms
                .filter(term => term.difficulty === 'intermediate')
                .sort((a, b) => a.name.localeCompare(b.name));
        },

        advancedTerms() {
            return this.terms
                .filter(term => term.difficulty === 'advanced')
                .sort((a, b) => a.name.localeCompare(b.name));
        }
    },

    methods: {
        async loadGlossaryData() {
            try {
                const response = await fetch('glossary-data.json');
                this.glossaryData = await response.json();
                this.categories = this.glossaryData.categories;
                this.terms = this.glossaryData.terms;
                console.log(`✅ Loaded ${this.terms.length} terms`);
            } catch (error) {
                console.error('Error loading glossary data:', error);
            }
        },

        toggleTerm(termName) {
            const index = this.expandedTerms.indexOf(termName);
            if (index > -1) {
                this.expandedTerms.splice(index, 1);
            } else {
                this.expandedTerms.push(termName);
            }
        },

        expandTerm(termName) {
            const term = this.terms.find(t => t.name === termName);
            if (term) {
                this.selectedTerm = term;
            }
        },

        expandCategory(categoryKey) {
            if (this.expandedCategory === categoryKey) {
                this.expandedCategory = null;
            } else {
                this.expandedCategory = categoryKey;
            }
        },

        getCategoryCount(categoryKey) {
            return this.terms.filter(term => term.category === categoryKey).length;
        },

        getCategoryTerms(categoryKey) {
            return this.terms
                .filter(term => term.category === categoryKey)
                .sort((a, b) => a.name.localeCompare(b.name));
        },

        getCategoryName(categoryKey) {
            return this.categories[categoryKey]?.classifierName || categoryKey;
        },

        getCategoryStyle(categoryKey) {
            const category = this.categories[categoryKey];
            if (!category) return {};

            return {
                backgroundColor: category.color,
                color: category.font?.color || 'white'
            };
        },

        getPreview(text, maxLength = 120) {
            if (!text) return '';
            if (text.length <= maxLength) return text;
            return text.substring(0, maxLength) + '...';
        },

        clearSearch() {
            this.searchQuery = '';
        }
    },

    watch: {
        // Clear letter filter when switching tabs or searching
        activeTab() {
            this.selectedLetter = null;
            this.expandedCategory = null;
        },

        searchQuery() {
            if (this.searchQuery) {
                this.selectedLetter = null;
            }
        }
    },

    mounted() {
        this.loadGlossaryData();
    }
}).mount('#app');
