import axios from "axios";
import { useEffect, useState } from "react";
import style from "./page.module.scss";
import Image from "next/image";
import ShareImage from "../components/ShareImage";

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
  const [showShareImage, setShowShareImage] = useState(false);
  const [selectedMovieTitles, setSelectedMovieTitles] = useState<string[]>([]);
  const [showSearchModule, setShowSearchModule] = useState(true);
  const [movieImageUrls, setMovieImageUrls] = useState<string[]>([]); // 映画の画像URLの配列の状態

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

  // 検索窓をクリアする
  const clearSearch = () => {
    setSearch("");
  };

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
    if (window.confirm("全て選択解除してリセットしますか？")) {
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

  // 共有するボタンをクリックした際の処理
  const handleShareClick = () => {
    // 選択中の映画のタイトルを設定
    setSelectedMovieTitles(selectedMovies.map((movie) => movie.title));

    // 選択中の映画の画像URLを設定
    const urls = selectedMovies.map(
      (movie) => `https://image.tmdb.org/t/p/w500/${movie.poster_path}`
    );
    setMovieImageUrls(urls);

    setShowShareImage(true);
    setShowSelectedList(false); // 選択中リストのモジュールを閉じる
    setShowSearchModule(false); // 検索モジュールを非表示にする
  };

  // 選び直すボタンの処理
  const handleEditList = () => {
    setShowShareImage(false);
    setShowSelectedList(true); // 選択中リストのモジュールを閉じる
    setShowSearchModule(true);
  };

  // シェア用背景画像
  const backgroundUrl = "test/merge-images/best-movie-bg.png";

  ////////////////////////ダミーデータ

  // 映画の画像URLの配列
  // const movieImageUrls = [
  //   "test/merge-images/mov1.jpeg",
  //   "test/merge-images/mov2.jpeg",
  //   "test/merge-images/mov3.jpeg"
  // ];

  ////////////////////////ダミーデータここまで

  return (
    <>
      <main className={style.searchPage}>
        {showShareImage && (
          <>
            <ShareImage
              backgroundUrl={backgroundUrl}
              movieImageUrls={movieImageUrls}
              movieTitles={selectedMovieTitles}
            />
            <button onClick={handleEditList} className={style.editList}>
              ← リストを編集する
            </button>
          </>
        )}
        <h1>⭐️わたしの2023映画ベスト10⭐️</h1>
        {showSearchModule && ( // 検索モジュールの表示/非表示を制御
          <div className={style.searchModule}>
            <div className={style.textInputWrapper}>
              <div className={style.searchContainer}>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="タイトルを入力"
                  className={style.textInput}
                />
                {search && <button onClick={clearSearch}>×</button>}
              </div>
              {selectedMovies.length > 0 && (
                <button
                  onClick={handleShowSelectedList}
                  className={style.movieCountButton}>
                  {selectedMovies.length}件選択中
                </button>
              )}
            </div>
            {movies.length > 0 ? (
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
                      <Image
                        src={`https://image.tmdb.org/t/p/w200/${movie.poster_path}`}
                        alt={movie.title}
                        width={165}
                        height={247}
                        unoptimized
                      />
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className={style.emptyText}>検索結果は0件です</p>
            )}
          </div>
        )}
        {showSelectedList && (
          <div className={style.selectedListModalWrapper}>
            <div className={style.selectedListModal}>
              <button
                className={style.modalCloseButton}
                onClick={handleCloseSelectedList}>
                ×
              </button>
              <div className={style.selectedListModalHeader}>
                <p className={style.selectedCount}>
                  {selectedMovies.length}件/10件選択中
                </p>
                <button
                  className={style.removeAllButton}
                  onClick={handleRemoveAllMovies}>
                  リセット
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
                <button
                  onClick={handleCloseSelectedList}
                  className={style.chooseAgainButton}>
                  選択に戻る
                </button>
                <button
                  onClick={handleShareClick}
                  disabled={selectedMovies.length !== 10}>
                  共有する→
                </button>
              </div>
            </div>
          </div>
        )}
        <div className={style.credit}>
          movie database by
          <Image src="/icon/tmdb_logo.svg" alt="TMDB" width={80} height={10} />
        </div>
      </main>
    </>
  );
}
