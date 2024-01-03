import axios from "axios";
import { useEffect, useState } from "react";
import style from "./page.module.scss";

interface Movie {
  id: number;
  title: string;
  poster_path?: string;
}

export default function MoviePage() {
  const [search, setSearch] = useState("");
  const [movies, setMovies] = useState<Movie[]>([]);
  const [selectedMovies, setSelectedMovies] = useState<Movie[]>([]);
  const [showSelectedList, setShowSelectedList] = useState(false);

  useEffect(() => {
    if (search) {
      axios
        .get(
          `https://api.themoviedb.org/3/search/movie?api_key=${
            process.env.NEXT_PUBLIC_TMDB_API_KEY
          }&language=ja&region=JP&query=${encodeURIComponent(search)}`
        )
        .then((response) => {
          setMovies(response.data.results);
        })
        .catch((error) => console.error(error));
    }
  }, [search]);

  const handleMovieSelect = (movie: Movie) => {
    if (selectedMovies.find((m) => m.id === movie.id)) {
      setSelectedMovies(selectedMovies.filter((m) => m.id !== movie.id));
    } else {
      if (selectedMovies.length >= 10) {
        alert("選択できるのは10件までです");
      } else {
        setSelectedMovies([...selectedMovies, movie]);
      }
    }
  };

  // 選択解除処理
  const handleRemoveMovie = (movieId: number) => {
    if (
      window.confirm(
        `${
          selectedMovies.find((m) => m.id === movieId)?.title
        }をリストから外しますか？`
      )
    ) {
      const updatedSelectedMovies = selectedMovies.filter(
        (m) => m.id !== movieId
      );
      setSelectedMovies(updatedSelectedMovies);

      // 選択件数が0になったらモーダルを閉じる
      if (updatedSelectedMovies.length === 0) {
        handleCloseSelectedList();
      }
    }
  };

  // 全ての選択を解除する処理
  const handleRemoveAllMovies = () => {
    if (window.confirm("リストをリセットしますか？")) {
      setSelectedMovies([]);
      handleCloseSelectedList();
    }
  };

  // 選択中の映画の順番を変更する処理
  const moveMovie = (movieId: number, direction: -1 | 1) => {
    const index = selectedMovies.findIndex((movie) => movie.id === movieId);
    if (index === -1) return;

    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= selectedMovies.length) return;

    const newMovies = [...selectedMovies];
    [newMovies[index], newMovies[newIndex]] = [
      newMovies[newIndex],
      newMovies[index]
    ];
    setSelectedMovies(newMovies);
  };

  const handleShowSelectedList = () => {
    setShowSelectedList(true);
  };

  const handleCloseSelectedList = () => {
    setShowSelectedList(false);
  };

  return (
    <>
      <main className={style.searchPage}>
        <h1>⭐️わたしの2023映画ベスト10⭐️</h1>
        <div className={style.searchModule}>
          <div className={style.textInputWrapper}>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="タイトルを入力"
              className={style.textInput}
            />
            {selectedMovies.length > 0 && (
              <button
                onClick={handleShowSelectedList}
                className={style.movieCountButton}>
                {selectedMovies.length}件選択中
              </button>
            )}
          </div>
          <ul className={style.movieList}>
            {movies.map((movie) => (
              <li
                key={movie.id}
                onClick={() => handleMovieSelect(movie)}
                className={
                  selectedMovies.find((m) => m.id === movie.id)
                    ? style.selected
                    : ""
                }>
                <div className={style.movieText}>
                  <p className={style.movieTitle}>{movie.title}</p>
                  {selectedMovies.find((m) => m.id === movie.id) && (
                    <p className={style.selectedText}>選択中</p>
                  )}
                </div>
                {movie.poster_path && (
                  <img
                    src={`https://image.tmdb.org/t/p/w200/${movie.poster_path}`}
                    alt={movie.title}
                  />
                )}
              </li>
            ))}
          </ul>
        </div>
        {showSelectedList && (
          <div className={style.selectedListModalWrapper}>
            <div className={style.selectedListModal}>
              <button
                className={style.modalCloseButton}
                onClick={handleCloseSelectedList}>
                X
              </button>
              <div className={style.selectedListModalHeader}>
                <p className={style.selectedCount}>
                  {selectedMovies.length}件/10件選択中
                </p>
                <button
                  className={style.removeAllButton}
                  onClick={handleRemoveAllMovies}>
                  リストをリセット
                </button>
              </div>
              <ul className={style.selectedList}>
                {selectedMovies.map((movie, index) => (
                  <li key={movie.id}>
                    <div className={style.sortButtons}>
                      <button onClick={() => moveMovie(movie.id, -1)}>
                        ⬆️
                      </button>
                      <button onClick={() => moveMovie(movie.id, 1)}>⬇️</button>
                    </div>
                    <p className={style.selectedTitle}>{movie.title}</p>
                    <button
                      className={style.removeButton}
                      onClick={() => handleRemoveMovie(movie.id)}>
                      ×
                    </button>
                  </li>
                ))}
              </ul>
              <div className={style.buttonWrapper}>
                <button onClick={handleCloseSelectedList}>選択に戻る</button>
                <button onClick={handleCloseSelectedList}>共有する→</button>
              </div>
            </div>
          </div>
        )}
        <div className={style.credit}>
          movie database by
          <img src="/icon/tmdb_logo.svg" alt="TMDB" />
        </div>
      </main>
    </>
  );
}
