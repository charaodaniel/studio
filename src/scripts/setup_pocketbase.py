# -*- coding: utf-8 -*-
import os
import sys
from pocketbase import PocketBase
from pocketbase.utils import ClientResponseError

# --- CONFIGURAÇÃO ---
# Preencha estas variáveis com suas credenciais de administrador do PocketBase.
# É recomendado usar variáveis de ambiente para segurança.
POCKETBASE_URL = os.environ.get("POCKETBASE_URL", "https://mobmv.shop")
POCKETBASE_ADMIN_EMAIL = os.environ.get("POCKETBASE_ADMIN_EMAIL", "daniel.kokynhw@gmail.com")
POCKETBASE_ADMIN_PASSWORD = os.environ.get("POCKETBASE_ADMIN_PASSWORD", "Dcm02061994@@")
# --- FIM DA CONFIGURAÇÃO ---


# Definição completa do Schema que o aplicativo precisa
collections_schema = {
    "users": {
        "is_auth": True,
        "fields": [
            {"name": "name", "type": "text", "required": False, "options": {"max": 255}},
            {"name": "avatar", "type": "file", "required": False, "options": {"maxSelect": 1, "mimeTypes": ["image/jpeg", "image/png", "image/webp"]}},
            {"name": "phone", "type": "text", "required": False, "options": {}},
            {"name": "role", "type": "select", "required": True, "options": {"maxSelect": 1, "values": ["Passageiro", "Motorista", "Atendente", "Admin"]}},
            {"name": "driver_status", "type": "select", "required": False, "options": {"maxSelect": 1, "values": ["online", "offline", "urban-trip", "rural-trip"]}},
            {"name": "driver_vehicle_model", "type": "text", "required": False, "options": {}},
            {"name": "driver_vehicle_plate", "type": "text", "required": False, "options": {}},
            {"name": "driver_vehicle_photo", "type": "file", "required": False, "options": {"maxSelect": 1, "mimeTypes": ["image/jpeg", "image/png", "image/webp"]}},
            {"name": "driver_cnpj", "type": "text", "required": False, "options": {}},
            {"name": "driver_pix_key", "type": "text", "required": False, "options": {}},
            {"name": "driver_fare_type", "type": "select", "required": False, "options": {"maxSelect": 1, "values": ["fixed", "km"]}},
            {"name": "driver_fixed_rate", "type": "number", "required": False, "options": {}},
            {"name": "driver_km_rate", "type": "number", "required": False, "options": {}},
            {"name": "driver_accepts_rural", "type": "bool", "required": False, "options": {}}
        ],
        "rules": {
            "listRule": "@request.auth.id != \"\"",
            "viewRule": "id = @request.auth.id || @request.auth.role = \"Admin\" || @request.auth.role = \"Atendente\"",
            "createRule": "",
            "updateRule": "id = @request.auth.id || @request.auth.role = \"Admin\"",
            "deleteRule": "@request.auth.role = \"Admin\""
        }
    },
    "rides": {
        "fields": [
            {"name": "passenger", "type": "relation", "required": True, "options": {"collectionId": "_pb_users_auth_", "maxSelect": 1}},
            {"name": "driver", "type": "relation", "required": False, "options": {"collectionId": "_pb_users_auth_", "maxSelect": 1}},
            {"name": "origin_address", "type": "text", "required": True, "options": {}},
            {"name": "destination_address", "type": "text", "required": True, "options": {}},
            {"name": "status", "type": "select", "required": True, "options": {"maxSelect": 1, "values": ["requested", "accepted", "in_progress", "completed", "canceled"]}},
            {"name": "fare", "type": "number", "required": True, "options": {}},
            {"name": "is_negotiated", "type": "bool", "required": True, "options": {}},
            {"name": "started_by", "type": "select", "required": True, "options": {"maxSelect": 1, "values": ["passenger", "driver"]}}
        ],
        "rules": {
            "listRule": "@request.auth.id != \"\" && (passenger = @request.auth.id || driver = @request.auth.id || @request.auth.role = \"Admin\" || @request.auth.role = \"Atendente\")",
            "viewRule": "@request.auth.id != \"\" && (passenger = @request.auth.id || driver = @request.auth.id || @request.auth.role = \"Admin\")",
            "createRule": "@request.auth.id != \"\" && (@request.auth.role = \"Passageiro\" || @request.auth.role = \"Admin\")",
            "updateRule": "@request.auth.id != \"\" && (driver = @request.auth.id || passenger = @request.auth.id || @request.auth.role = \"Admin\")",
            "deleteRule": "@request.auth.role = \"Admin\""
        }
    },
    "messages": {
        "fields": [
            {"name": "ride", "type": "relation", "required": True, "options": {"collectionId": "rides", "maxSelect": 1}},
            {"name": "sender", "type": "relation", "required": True, "options": {"collectionId": "_pb_users_auth_", "maxSelect": 1}},
            {"name": "text", "type": "text", "required": True, "options": {}}
        ],
        "rules": {
            "listRule": "@request.auth.id != \"\" && (ride.passenger = @request.auth.id || ride.driver = @request.auth.id || @request.auth.role = \"Admin\" || @request.auth.role = \"Atendente\")",
            "viewRule": "@request.auth.id != \"\" && (ride.passenger = @request.auth.id || ride.driver = @request.auth.id || @request.auth.role = \"Admin\")",
            "createRule": "@request.auth.id != \"\" && (ride.passenger = @request.auth.id || ride.driver = @request.auth.id)",
            "updateRule": "@request.auth.role = \"Admin\"",
            "deleteRule": "@request.auth.role = \"Admin\""
        }
    },
    "driver_documents": {
        "fields": [
            {"name": "driver", "type": "relation", "required": True, "options": {"collectionId": "_pb_users_auth_", "maxSelect": 1}},
            {"name": "document_type", "type": "select", "required": True, "options": {"maxSelect": 1, "values": ["CNH", "CRLV"]}},
            {"name": "file", "type": "file", "required": True, "options": {"maxSelect": 1}},
            {"name": "is_verified", "type": "bool", "required": False, "options": {}}
        ],
        "rules": {
            "listRule": "@request.auth.id != \"\" && (driver = @request.auth.id || @request.auth.role = \"Admin\")",
            "viewRule": "@request.auth.id != \"\" && (driver = @request.auth.id || @request.auth.role = \"Admin\")",
            "createRule": "@request.auth.id != \"\" && driver = @request.auth.id",
            "updateRule": "@request.auth.id != \"\" && (driver = @request.auth.id || @request.auth.role = \"Admin\")",
            "deleteRule": "@request.auth.role = \"Admin\""
        }
    },
    "driver_status_logs": {
        "fields": [
            {"name": "driver", "type": "relation", "required": True, "options": {"collectionId": "_pb_users_auth_", "maxSelect": 1}},
            {"name": "status", "type": "text", "required": True, "options": {}}
        ],
        "rules": {
            "listRule": "@request.auth.role = \"Admin\"",
            "viewRule": "@request.auth.role = \"Admin\"",
            "createRule": "@request.auth.role = \"Admin\"",
            "updateRule": "\"\"",
            "deleteRule": "\"\""
        }
    }
}


def main():
    """Main function to run the setup script."""
    print(f"Iniciando configuração no servidor: {POCKETBASE_URL}")

    try:
        client = PocketBase(POCKETBASE_URL)
        client.admins.auth_with_password(POCKETBASE_ADMIN_EMAIL, POCKETBASE_ADMIN_PASSWORD)
        print("✅ Autenticado no PocketBase como Super Administrador!")
    except ClientResponseError as e:
        print(f"❌ Falha na autenticação: {e}", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f"❌ Ocorreu um erro ao conectar: {e}", file=sys.stderr)
        sys.exit(1)

    all_collections = client.collections.get_full_list()
    collection_map = {c.name: c for c in all_collections}

    for name, schema_def in collections_schema.items():
        print(f"\nIniciando sincronização da coleção '{name}'...")
        
        collection = collection_map.get(name)
        is_auth = schema_def.get("is_auth", False)
        
        if collection:
            print(f"- Coleção '{name}' já existe. Verificando campos...")
            existing_fields = {field.name for field in collection.schema}
            
            for field_def in schema_def["fields"]:
                if field_def["name"] not in existing_fields:
                    print(f"  - Adicionando campo '{field_def['name']}' à coleção '{name}'.")
                    try:
                        collection.schema.append(field_def)
                    except Exception as e:
                         print(f"  - AVISO: Não foi possível adicionar o campo '{field_def['name']}' via script. Talvez precise adicioná-lo manualmente. Erro: {e}", file=sys.stderr)
                
            try:
                # Envia apenas o schema atualizado
                client.collections.update(collection.id, {"schema": collection.schema})
                print(f"✅ Schema da coleção '{name}' sincronizado com sucesso.")
            except ClientResponseError as e:
                print(f"❌ Erro ao sincronizar schema da coleção '{name}': {e.data}", file=sys.stderr)
            
        else:
            print(f"- Criando nova coleção '{name}'...")
            try:
                client.collections.create({
                    "name": name,
                    "type": "auth" if is_auth else "base",
                    "schema": schema_def["fields"]
                })
                print(f"✅ Coleção '{name}' criada com sucesso.")
            except ClientResponseError as e:
                print(f"❌ Erro ao criar a coleção '{name}': {e.data}", file=sys.stderr)


    print("\n--- Aplicando Regras de API ---")
    
    # É necessário buscar as coleções novamente para garantir que os IDs estão atualizados
    all_collections_refreshed = client.collections.get_full_list()
    collection_map_refreshed = {c.name: c for c in all_collections_refreshed}

    for name, schema_def in collections_schema.items():
        collection = collection_map_refreshed.get(name)
        if collection and "rules" in schema_def:
            try:
                client.collections.update(collection.id, schema_def["rules"])
                print(f"✅ Regras da coleção '{name}' aplicadas com sucesso.")
            except ClientResponseError as e:
                print(f"❌ Erro ao aplicar regras na coleção '{name}': {e.data}", file=sys.stderr)

    print("\n🎉 Script de configuração concluído!")


if __name__ == "__main__":
    main()
