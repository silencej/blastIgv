#!/bin/bash

mkdir -p data/queries data/fasta data/blastdb data/blastdb_custom data/results

## Retrieve query sequence
CONNAME=blastigv-blast-1
docker exec $CONNAME efetch -db protein -format fasta -id P01349 > data/queries/P01349.fsa
    
## Retrieve database sequences
docker exec $CONNAME efetch -db protein -format fasta -id Q90523,P80049,P83981,P83982,P83983,P83977,P83984,P83985,P27950 > data/fasta/nurse-shark-proteins.fsa
    
## Step 2. Make BLAST database 
docker exec -w /blast/blastdb_custom $CONNAME makeblastdb -in /blast/fasta/nurse-shark-proteins.fsa -dbtype prot -parse_seqids -out nurse-shark-proteins -title "Nurse shark proteins" -taxid 7801 -blastdb_version 5
