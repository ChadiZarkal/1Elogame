-- Migration: Seed standard Flash Flag test pack
-- Date: 23 juin 2026

DO $$
DECLARE
  v_test_id UUID;
  v_question JSONB;
  v_option JSONB;
  v_qidx INT;
  v_oidx INT;
  v_qid UUID;
BEGIN
  IF EXISTS (
    SELECT 1 FROM flashflag_tests WHERE name = 'Radar Date Express' AND is_standard = true
  ) THEN
    RETURN;
  END IF;

  INSERT INTO flashflag_tests (name, description, is_standard, is_active, created_by)
  VALUES (
    'Radar Date Express',
    'Questionnaire standard chrono pour detecter les signaux red flag sans sur-reflexion.',
    true,
    true,
    'admin'
  )
  RETURNING id INTO v_test_id;

  FOR v_question, v_qidx IN
    SELECT value, ordinality::int FROM jsonb_array_elements(
      '[
        {"question":"Es-tu feministe ?","time":7,"options":[{"text":"Oui","score":0},{"text":"C est complique","score":1},{"text":"Non","score":2}]},
        {"question":"Es-tu deja alle voir un psy ?","time":7,"options":[{"text":"Oui","score":0},{"text":"Non","score":1},{"text":"J en ai pas besoin","score":2}]},
        {"question":"Ton meilleur pote trompe sa copine ?","time":7,"options":[{"text":"Je le recadre","score":0},{"text":"Je la previens","score":1},{"text":"Je le couvre","score":2}]},
        {"question":"As-tu deja pleure devant un film ?","time":7,"options":[{"text":"Oui","score":0},{"text":"Rarement","score":1},{"text":"Non jamais","score":2}]},
        {"question":"Les compliments dans la rue ?","time":7,"options":[{"text":"C est lourd","score":0},{"text":"C est normal","score":1},{"text":"C est flatteur","score":2}]},
        {"question":"Elle dit pas ce soir ?","time":7,"options":[{"text":"Ok pas de souci","score":0},{"text":"Mais pourquoi ?","score":1},{"text":"J insiste un peu","score":2}]},
        {"question":"Elle sort en boite sans toi ?","time":7,"options":[{"text":"Amuse-toi bien","score":0},{"text":"Fais attention aux mecs","score":1},{"text":"Tu rentres a quelle heure ?","score":2}]},
        {"question":"Apres une grosse dispute ?","time":7,"options":[{"text":"On en discute","score":0},{"text":"Je fais le mort","score":1},{"text":"J attends ses excuses","score":2}]},
        {"question":"Ton ex en un mot ?","time":7,"options":[{"text":"Une histoire passee","score":0},{"text":"C etait une folle","score":1},{"text":"Une manipulatrice","score":2}]},
        {"question":"Ton bord politique ?","time":7,"options":[{"text":"La gauche","score":0},{"text":"Apolitique centre","score":1},{"text":"La droite","score":2}]},
        {"question":"Face au slogan Men are trash ?","time":7,"options":[{"text":"Je comprends l idee","score":0},{"text":"Not all men","score":1},{"text":"C est misandre","score":2}]},
        {"question":"Le privilege masculin ?","time":7,"options":[{"text":"J en suis conscient","score":0},{"text":"J ai galere aussi","score":1},{"text":"Ca n existe pas","score":2}]},
        {"question":"Sur la question du genre ?","time":7,"options":[{"text":"C est un spectre","score":0},{"text":"C est une mode d internet","score":1},{"text":"Il n y a que deux genres","score":2}]},
        {"question":"La masculinite toxique ?","time":7,"options":[{"text":"Un probleme systemique","score":0},{"text":"Un terme exagere","score":1},{"text":"C est une invention","score":2}]},
        {"question":"Les milliardaires ?","time":7,"options":[{"text":"Il faut les taxer massivement","score":0},{"text":"Ils ont travaille dur","score":1},{"text":"Ce sont des genies","score":2}]}
      ]'::jsonb
    ) WITH ORDINALITY
  LOOP
    INSERT INTO flashflag_questions (test_id, position, question_text, time_limit_sec)
    VALUES (v_test_id, v_qidx - 1, v_question->>'question', COALESCE((v_question->>'time')::int, 7))
    RETURNING id INTO v_qid;

    FOR v_option, v_oidx IN
      SELECT value, ordinality::int FROM jsonb_array_elements(v_question->'options') WITH ORDINALITY
    LOOP
      INSERT INTO flashflag_options (question_id, position, option_text, score)
      VALUES (
        v_qid,
        v_oidx - 1,
        v_option->>'text',
        (v_option->>'score')::int
      );
    END LOOP;
  END LOOP;
END $$;
