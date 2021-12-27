import styles from "./InfoCorner.module.css";

/*
Quarto di cerchio in alto a DX con le 3 icone.
Github Twitter e Info su come funziona l'app (forse anche articolo)
*/
export function InfoCorner() {
  return (
    <div className={styles.container}>
      <div className={styles.items}>
        <span title="Github">G</span>
        <span title="Twitter">T</span>
        <span title="Info">I</span>
      </div>
    </div>
  );
}
