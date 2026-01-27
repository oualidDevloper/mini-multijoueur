import { motion, AnimatePresence } from 'framer-motion';

const RULES = {
    tictactoe: {
        title: "Morpion (Tic-Tac-Toe)",
        text: "Alignez 3 symboles identiques (horizontalement, verticalement ou en diagonale) pour gagner. Empêchez votre adversaire de faire de même !"
    },
    rps: {
        title: "Pierre Feuille Ciseaux",
        text: "Choisissez secrètement votre arme. La Pierre bat les Ciseaux, les Ciseaux battent la Feuille, et la Feuille bat la Pierre."
    },
    memory: {
        title: "Memory",
        text: "Trouvez les paires de cartes identiques. Retournez deux cartes : si elles correspondent, vous rejouez et marquez un point. Sinon, elles se retournent."
    },
    connect4: {
        title: "Puissance 4",
        text: "Alignez 4 jetons de votre couleur horizontalement, verticalement ou en diagonale. La gravité fait tomber les jetons vers le bas."
    },
    reflex: {
        title: "Réflexe",
        text: "Attendez le signal VERT. Le premier à cliquer gagne la manche. Attention aux faux départs !"
    },
    hangman: {
        title: "Le Pendu",
        text: "Devinez le mot caché lettre par lettre. Chaque erreur rapproche le bonhomme de la pendaison. Coopérez ou jouez chacun votre tour !"
    }
};

export default function RulesModal({ gameType, onClose }) {
    if (!gameType) return null;
    const rule = RULES[gameType];

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: 20 }}
                    className="bg-gray-900 border border-white/20 p-8 rounded-2xl max-w-md w-full shadow-2xl relative"
                    onClick={(e) => e.stopPropagation()}
                >
                    <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">✕</button>
                    <h2 className="text-2xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                        {rule.title}
                    </h2>
                    <p className="text-gray-300 leading-relaxed text-lg">
                        {rule.text}
                    </p>
                    <div className="mt-8 flex justify-end">
                        <button onClick={onClose} className="btn-primary py-2 px-6 text-sm">Compris !</button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
